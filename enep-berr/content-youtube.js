// --- RÉGLAGES (chargés depuis la page d'options, et relus en direct) ---
const DEFAULT_MAX_SHORTS_PER_DAY = 10;

let maxShortsPerDay = DEFAULT_MAX_SHORTS_PER_DAY;
let blockShortsEnabled = false;
let dailyShorts = { date: getTodayDateString(), count: 0 };

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

// Si le jour a changé depuis la dernière lecture, on repart de 0
function normaliserJour(data) {
  const today = getTodayDateString();
  if (!data || data.date !== today) {
    return { date: today, count: 0 };
  }
  return data;
}

function loadSettings() {
  return browser.storage.local.get({
    maxShorts: DEFAULT_MAX_SHORTS_PER_DAY,
    blockShorts: false,
    dailyShorts: { date: getTodayDateString(), count: 0 }
  }).then((result) => {
    maxShortsPerDay = result.maxShorts;
    blockShortsEnabled = result.blockShorts;
    dailyShorts = normaliserJour(result.dailyShorts);
  });
}

function sauvegarderCompteur() {
  browser.storage.local.set({ dailyShorts });
}

function incrementerCompteur() {
  dailyShorts = normaliserJour(dailyShorts);
  dailyShorts.count += 1;
  sauvegarderCompteur();
  return dailyShorts.count;
}

// Réagit immédiatement si les réglages OU les compteurs changent ailleurs
// (page d'options ouverte à côté : bouton "Réinitialiser", changement de quota, etc.)
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.maxShorts) {
    maxShortsPerDay = changes.maxShorts.newValue;
  }
  if (changes.dailyShorts) {
    dailyShorts = normaliserJour(changes.dailyShorts.newValue);
  }
  if (changes.blockShorts) {
    blockShortsEnabled = changes.blockShorts.newValue;
    if (blockShortsEnabled && window.location.pathname.startsWith("/shorts/")) {
      window.location.href = "https://www.youtube.com/";
      return;
    }
  }
  hideShortsForToday();
});

// --- MASQUAGE DES SHORTS (blocage total OU quota du jour atteint) ---
function hideShortsForToday() {
  try {
    dailyShorts = normaliserJour(dailyShorts);
    const shouldHide = blockShortsEnabled || dailyShorts.count >= maxShortsPerDay;

    document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer')
      .forEach(el => el.style.display = shouldHide ? 'none' : '');

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

    if (blockShortsEnabled) {
      console.log("[ENEP-BERR] Shorts bloqués (option activée). Redirection...");
      window.location.href = "https://www.youtube.com/";
      return;
    }

    dailyShorts = normaliserJour(dailyShorts);

    if (dailyShorts.count >= maxShortsPerDay) {
      console.log("[ENEP-BERR] Quota quotidien atteint ! Redirection...");
      window.location.href = "https://www.youtube.com/";
      return;
    }

    if (lastCountedShort !== window.location.pathname) {
      lastCountedShort = window.location.pathname;
      const count = incrementerCompteur();
      console.log(`[ENEP-BERR] Short vu ${count}/${maxShortsPerDay}`);

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