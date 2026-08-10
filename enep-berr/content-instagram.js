// --- RÉGLAGES (chargés depuis la page d'options, et relus en direct) ---
const DEFAULT_MAX_REELS_PER_DAY = 10;

let maxReelsPerDay = DEFAULT_MAX_REELS_PER_DAY;
let dailyReels = { date: getTodayDateString(), count: 0 };

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function normaliserJour(data) {
  const today = getTodayDateString();
  if (!data || data.date !== today) {
    return { date: today, count: 0 };
  }
  return data;
}

function loadSettings() {
  return browser.storage.local.get({
    maxReels: DEFAULT_MAX_REELS_PER_DAY,
    dailyReels: { date: getTodayDateString(), count: 0 }
  }).then((result) => {
    maxReelsPerDay = result.maxReels;
    dailyReels = normaliserJour(result.dailyReels);
  });
}

function sauvegarderCompteur() {
  browser.storage.local.set({ dailyReels });
}

function incrementerCompteur() {
  dailyReels = normaliserJour(dailyReels);
  dailyReels.count += 1;
  sauvegarderCompteur();
  return dailyReels.count;
}

// Réagit immédiatement si les réglages OU les compteurs changent ailleurs
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.maxReels) {
    maxReelsPerDay = changes.maxReels.newValue;
  }
  if (changes.dailyReels) {
    dailyReels = normaliserJour(changes.dailyReels.newValue);
  }
  hideDistractions();
});

// --- MASQUAGE DES ÉLÉMENTS SUR INSTAGRAM ---
function hideDistractions() {
  try {
    dailyReels = normaliserJour(dailyReels);
    const shouldHide = dailyReels.count >= maxReelsPerDay;

    // 1. Masquage du bouton Reels dans le menu si quota atteint
    const links = document.querySelectorAll('a[href="/reels/"], a[href^="/reels/"]');
    links.forEach(link => {
      const parent = link.closest('span') || link.parentElement;
      if (parent) parent.style.display = shouldHide ? 'none' : '';
    });

    // 2. Masquage systématique de la grille sur /explore/ (indépendant du quota)
    if (window.location.pathname.includes("/explore/")) {
      const exploreMain = document.querySelector('main[role="main"]');
      if (exploreMain) {
        const gridSection = exploreMain.querySelector('section');
        if (gridSection) gridSection.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('[ENEP-BERR] Erreur masquage :', err);
  }
}

// --- SURVEILLANCE DU DOM (MUTATION OBSERVER) ---
function startObserver() {
  if (document.body) {
    const observer = new MutationObserver(hideDistractions);
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", startObserver);
  }
}

// --- LOGIQUE BASÉE SUR L'URL ---
let lastUrl = location.href;
let lastCountedReel = null; // évite de compter deux fois le même Reel

function checkUrlChange() {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    onUrlChange();
  }
}

function onUrlChange() {
  if (window.location.pathname.includes("/reel/") || window.location.pathname.includes("/reels/")) {

    dailyReels = normaliserJour(dailyReels);

    if (dailyReels.count >= maxReelsPerDay) {
      console.log("[ENEP-BERR] Quota quotidien atteint ! Redirection...");
      window.location.href = "https://www.instagram.com/";
      return;
    }

    if (lastCountedReel !== window.location.pathname) {
      lastCountedReel = window.location.pathname;
      const count = incrementerCompteur();
      console.log(`[ENEP-BERR] Reel vu ${count}/${maxReelsPerDay}`);

      if (count > maxReelsPerDay) {
        window.location.href = "https://www.instagram.com/";
        return;
      }
    }

  } else {
    lastCountedReel = null;
  }

  hideDistractions();
}

// --- Initialisation ---
loadSettings().then(() => {
  startObserver();
  hideDistractions();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onUrlChange);
  } else {
    onUrlChange();
  }
});

setInterval(checkUrlChange, 400);