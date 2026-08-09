// --- RÉGLAGES (chargés depuis la page d'options) ---
const DEFAULT_MAX_SHORTS_PER_DAY = 10;

let maxShortsPerDay = DEFAULT_MAX_SHORTS_PER_DAY;
let blockShortsEnabled = false;

function loadSettings() {
  return browser.storage.local.get({
    maxShorts: DEFAULT_MAX_SHORTS_PER_DAY,
    blockShorts: false
  }).then((result) => {
    maxShortsPerDay = result.maxShorts;
    blockShortsEnabled = result.blockShorts;
  });
}

// Réagit immédiatement si les réglages changent pendant que YouTube est ouvert
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.maxShorts) {
    maxShortsPerDay = changes.maxShorts.newValue;
  }
  if (changes.blockShorts) {
    blockShortsEnabled = changes.blockShorts.newValue;
    // Si on vient d'activer le blocage total et qu'on est déjà sur un Short, on sort tout de suite
    if (blockShortsEnabled && window.location.pathname.startsWith("/shorts/")) {
      window.location.href = "https://www.youtube.com/";
      return;
    }
  }
  hideShortsForToday();
});

// --- GESTION DU STOCKAGE QUOTIDIEN (compteur local, par jour) ---
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getDailyData() {
  const today = getTodayDateString();
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem('enep_daily_shorts') || '{}');
  } catch (e) {
    stored = {};
  }

  if (stored.date !== today) {
    const newData = { date: today, count: 0 };
    localStorage.setItem('enep_daily_shorts', JSON.stringify(newData));
    return newData;
  }
  return stored;
}

function incrementDailyCount() {
  const data = getDailyData();
  data.count += 1;
  localStorage.setItem('enep_daily_shorts', JSON.stringify(data));
  return data.count;
}

// --- MASQUAGE DES SHORTS (blocage total OU quota du jour atteint) ---
function hideShortsForToday() {
  try {
    const dailyData = getDailyData();
    const shouldHide = blockShortsEnabled || dailyData.count >= maxShortsPerDay;

    // Masque les carrousels / étagères
    document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer')
      .forEach(el => el.style.display = shouldHide ? 'none' : '');

    // Masque le bouton dans le menu latéral
    document.querySelectorAll('a[title="Shorts"]').forEach(link => {
      const parent = link.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
      if (parent) parent.style.display = shouldHide ? 'none' : '';
    });
  } catch (err) {
    console.error('[ENEP-BERR] Erreur masquage:', err);
  }
}

// --- DÉMARRAGE SÉCURISÉ DE L'OBSERVER ---
function startObserver() {
  if (document.body) {
    const observer = new MutationObserver(hideShortsForToday);
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", startObserver);
  }
}

// --- LOGIQUE BASÉE SUR L'URL ---
let lastUrl = location.href;
let lastCountedShort = null; // évite de compter deux fois le même Short

function checkUrlChange() {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    onUrlChange();
  }
}

function onUrlChange() {
  if (window.location.pathname.startsWith("/shorts/")) {

    // 1. Blocage total activé -> redirection immédiate, sans même regarder le quota
    if (blockShortsEnabled) {
      console.log("[ENEP-BERR] Shorts bloqués (option activée). Redirection...");
      window.location.href = "https://www.youtube.com/";
      return;
    }

    const dailyData = getDailyData();

    // 2. Quota quotidien déjà atteint -> redirection
    if (dailyData.count >= maxShortsPerDay) {
      console.log("[ENEP-BERR] Quota quotidien atteint ! Redirection...");
      window.location.href = "https://www.youtube.com/";
      return;
    }

    // 3. Nouveau Short -> on l'ajoute au compteur du jour (une seule fois par URL)
    if (lastCountedShort !== window.location.pathname) {
      lastCountedShort = window.location.pathname;
      const count = incrementDailyCount();
      console.log(`[ENEP-BERR] Short vu ${count}/${maxShortsPerDay}`);

      // Si ce Short nous fait dépasser le quota, on redirige tout de suite
      if (count > maxShortsPerDay) {
        window.location.href = "https://www.youtube.com/";
        return;
      }
    }

  } else {
    lastCountedShort = null;
  }

  hideShortsForToday();
}

// --- Initialisation ---
loadSettings().then(() => {
  startObserver();
  hideShortsForToday();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onUrlChange);
  } else {
    onUrlChange();
  }
});

setInterval(checkUrlChange, 300);
window.addEventListener("yt-navigate-finish", onUrlChange);