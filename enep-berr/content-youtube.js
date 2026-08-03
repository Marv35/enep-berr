// CONFIGURATION
const MAX_SHORTS_PER_SESSION = 2; // 2 Shorts vus max par session (soit 1 scroll)
const MAX_SESSIONS_PER_DAY = 2;   // 2 sessions max par jour

// --- GESTION DU STOCKAGE QUOTIDIEN ---
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
    const newData = { date: today, sessionCount: 0 };
    localStorage.setItem('enep_daily_shorts', JSON.stringify(newData));
    return newData;
  }
  return stored;
}

function incrementDailySession() {
  const data = getDailyData();
  data.sessionCount += 1;
  localStorage.setItem('enep_daily_shorts', JSON.stringify(data));
  return data.sessionCount;
}

// --- MASQUAGE DES SHORTS SI QUOTA ATTEINT ---
function hideShortsForToday() {
  try {
    const dailyData = getDailyData();
    if (dailyData.sessionCount >= MAX_SESSIONS_PER_DAY) {
      // Masque les carrousels / étagères
      document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer')
        .forEach(el => el.style.display = 'none');

      // Masque le bouton dans le menu latéral
      document.querySelectorAll('a[title="Shorts"]').forEach(link => {
        const parent = link.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
        if (parent) parent.style.display = 'none';
      });
    }
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
    // Si document.body n'existe pas encore, on réessaye dans quelques millisecondes
    document.addEventListener("DOMContentLoaded", startObserver);
  }
}

// --- LOGIQUE BASÉE SUR L'URL ---
let lastUrl = location.href;
let shortsSeenInCurrentSession = 0;
let isNewSession = true;

function checkUrlChange() {
  const currentUrl = location.href;

  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    onUrlChange();
  }
}

function onUrlChange() {
  const dailyData = getDailyData();

  if (window.location.pathname.startsWith("/shorts/")) {
    
    // 1. Quota quotidien dépassé -> Redirection Google
    if (dailyData.sessionCount >= MAX_SESSIONS_PER_DAY) {
      window.location.href = "https://www.youtube.com/";
      return;
    }

    // 2. Début d'une nouvelle session
    if (isNewSession) {
      isNewSession = false;
      shortsSeenInCurrentSession = 0;
      incrementDailySession();
      console.log(`[ENEP-BERR] Session démarrée (${getDailyData().sessionCount}/${MAX_SESSIONS_PER_DAY})`);
    }

    // 3. On compte le Short courant
    shortsSeenInCurrentSession++;
    console.log(`[ENEP-BERR] Short vu n°${shortsSeenInCurrentSession}/${MAX_SHORTS_PER_SESSION}`);

    // 4. Redirection si dépassement
    if (shortsSeenInCurrentSession > MAX_SHORTS_PER_SESSION) {
      window.location.href = "https://www.youtube.com/";
    }

  } else {
    // Hors des Shorts : réinitialisation pour la prochaine fois
    isNewSession = true;
    shortsSeenInCurrentSession = 0;
  }

  hideShortsForToday();
}

// Initialisation sécurisée
startObserver();
setInterval(checkUrlChange, 300);
window.addEventListener("yt-navigate-finish", onUrlChange);

// Premier passage
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onUrlChange);
} else {
  onUrlChange();
}