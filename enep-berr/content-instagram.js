// CONFIGURATION INSTAGRAM
const MAX_REELS_PER_SESSION = 6; 
const MAX_SESSIONS_PER_DAY = 3;

// --- GESTION DU STOCKAGE QUOTIDIEN ---
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getDailyData() {
  const today = getTodayDateString();
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem('enep_daily_reels') || '{}');
  } catch (e) {
    stored = {};
  }
  
  if (stored.date !== today) {
    const newData = { date: today, sessionCount: 0 };
    localStorage.setItem('enep_daily_reels', JSON.stringify(newData));
    return newData;
  }
  return stored;
}

function incrementDailySession() {
  const data = getDailyData();
  data.sessionCount += 1;
  localStorage.setItem('enep_daily_reels', JSON.stringify(data));
  return data.sessionCount;
}

// --- MASQUAGE DES ÉLÉMENTS SUR INSTAGRAM ---
function hideDistractions() {
  try {
    const dailyData = getDailyData();
    console.log("[ENEP-BERR DEBUG] Exécution de hideDistractions sur :", window.location.pathname);

    // 1. Test du masquage du bouton dans le menu
    if (dailyData.sessionCount >= MAX_SESSIONS_PER_DAY) {
      const links = document.querySelectorAll('a[href="/reels/"], a[href^="/reels/"]');
      console.log(`[ENEP-BERR DEBUG] Boutons Reels trouvés : ${links.length}`);
      links.forEach(link => {
        const parent = link.closest('span') || link.parentElement;
        if (parent) parent.style.display = 'none';
      });
    }

    // 2. Test du masquage sur /explore/
    if (window.location.pathname.includes("/explore/")) {
      const targetClass = ".x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x5o85r1.xeo4mu6";
      const elementsByClass = document.querySelectorAll(targetClass);
      console.log(`[ENEP-BERR DEBUG] Éléments par classe trouvés sur Explore : ${elementsByClass.length}`);

      const exploreMain = document.querySelector('main[role="main"]');
      console.log("[ENEP-BERR DEBUG] Balise <main> trouvée :", !!exploreMain);

      if (exploreMain) {
        const gridSection = exploreMain.querySelector('section');
        console.log("[ENEP-BERR DEBUG] Section de grille trouvée :", !!gridSection);
        if (gridSection) {
          gridSection.style.display = 'none';
        }
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

// --- LOGIQUE DE NAVIGATION ET LIMITES ---
let lastUrl = location.href;
let reelsSeenInCurrentSession = 0;
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

  // Si l'utilisateur est dans le flux Reels
  if (window.location.pathname.includes("/reel/") || window.location.pathname.includes("/reels/")) {
    
    // 1. Quota quotidien dépassé -> Redirection immédiate
    if (dailyData.sessionCount >= MAX_SESSIONS_PER_DAY) {
      console.log("[ENEP-BERR] Quota quotidien atteint ! Redirection...");
      window.location.href = "https://www.instagram.com/";
      return;
    }

    // 2. Début d'une nouvelle session
    if (isNewSession) {
      isNewSession = false;
      reelsSeenInCurrentSession = 0;
      incrementDailySession();
      console.log(`[ENEP-BERR] Session Reels démarrée (${getDailyData().sessionCount}/${MAX_SESSIONS_PER_DAY})`);
    }

    // 3. Compte du Reel vu
    reelsSeenInCurrentSession++;
    console.log(`[ENEP-BERR] Reel vu n°${reelsSeenInCurrentSession}/${MAX_REELS_PER_SESSION}`);

    // 4. Redirection si la limite par session est dépassée (ex: + de 6 Reels)
    if (reelsSeenInCurrentSession > MAX_REELS_PER_SESSION) {
      console.log("[ENEP-BERR] Limite de session atteinte ! Redirection...");
      window.location.href = "https://www.instagram.com/";
    }

  } else {
    // Hors des Reels : réinitialisation de la session
    isNewSession = true;
    reelsSeenInCurrentSession = 0;
  }

  // Vérification systématique du masquage
  hideDistractions();
}

// Lancement
startObserver();
setInterval(checkUrlChange, 400);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onUrlChange);
} else {
  onUrlChange();
}