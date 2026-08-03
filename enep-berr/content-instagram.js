// CONFIGURATION INSTAGRAM
const MAX_REELS_PER_SESSION = 6; 

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
  // Détection des URLs du type instagram.com/reels/ ou /reel/
  if (window.location.pathname.includes("/reel/") || window.location.pathname.includes("/reels/")) {
    
    // Début d'une nouvelle session
    if (isNewSession) {
      isNewSession = false;
      reelsSeenInCurrentSession = 0;
      console.log("[ENEP-BERR] Nouvelle session Reels démarrée");
    }

    // On compte le Reel courant
    reelsSeenInCurrentSession++;
    console.log(`[ENEP-BERR] Reel vu n°${reelsSeenInCurrentSession}/${MAX_REELS_PER_SESSION}`);

    // Redirection si dépassement des 6 Reels
    if (reelsSeenInCurrentSession > MAX_REELS_PER_SESSION) {
      console.log("[ENEP-BERR] Limite atteinte ! Redirection...");
      window.location.href = "https://www.instagram.com/"; // Renvoie sur le fil classique
    }

  } else {
    // Hors du flux Reels : réinitialisation de la session
    isNewSession = true;
    reelsSeenInCurrentSession = 0;
  }
}

// Surveillance des changements d'URL (Instagram est aussi une SPA)
setInterval(checkUrlChange, 400);

// Premier passage au chargement de la page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onUrlChange);
} else {
  onUrlChange();
}