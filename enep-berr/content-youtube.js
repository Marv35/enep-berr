// Actif uniquement sur les vidéos YouTube classiques (/watch?v=...), jamais sur les Shorts

const SECONDES_AVANT_FIN = 60;

let currentVideoId = null;
let noteDejaProposee = false;
let currentVideo = null;

function getVideoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('v');
}

function estPageVideo() {
  return window.location.pathname === '/watch' && !!getVideoId();
}

function detacherVideo() {
  if (currentVideo) {
    currentVideo.removeEventListener('timeupdate', onTimeUpdate);
    currentVideo = null;
  }
}

function fermerPostit() {
  const postit = document.getElementById('enep-postit');
  if (postit) postit.remove();
}

function reinitialiserPourNouvelleVideo() {
  const videoId = getVideoId();
  if (videoId !== currentVideoId) {
    currentVideoId = videoId;
    noteDejaProposee = false;
    detacherVideo();
    fermerPostit(); // au cas où un post-it de la vidéo précédente traînerait encore
  }
}

function attacherVideo() {
  if (!estPageVideo()) {
    detacherVideo();
    return;
  }
  const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
  if (!video || video === currentVideo) return;

  detacherVideo();
  currentVideo = video;
  currentVideo.addEventListener('timeupdate', onTimeUpdate);
}

function onTimeUpdate() {
  if (noteDejaProposee) return;
  if (!currentVideo || !currentVideo.duration || Number.isNaN(currentVideo.duration)) return;

  // Vidéo trop courte pour qu'"1 minute avant la fin" ait un sens -> on n'affiche rien
  if (currentVideo.duration < SECONDES_AVANT_FIN + 10) return;

  const tempsRestant = currentVideo.duration - currentVideo.currentTime;
  if (tempsRestant <= SECONDES_AVANT_FIN) {
    noteDejaProposee = true;
    afficherPostIt();
  }
}

// --- Post-it ---

function afficherPostIt() {
  if (document.getElementById('enep-postit')) return;

  const postit = document.createElement('div');
  postit.id = 'enep-postit';
  postit.style.cssText = `
    position: fixed;
    top: 20%;
    right: 5%;
    width: 300px;
    background: #fffa8d;
    box-shadow: 2px 4px 10px rgba(0,0,0,0.3);
    padding: 15px;
    z-index: 999999;
    font-family: sans-serif;
    border-radius: 4px;
  `;

  postit.innerHTML = `
    <button id="enep-postit-close" aria-label="Fermer" style="
      position: absolute; top: 6px; right: 8px;
      border: none; background: transparent;
      font-size: 16px; line-height: 1; cursor: pointer; color: #555;">✕</button>
    <h3 style="margin: 0 0 8px; color: #333; padding-right: 20px;">Qu'as-tu retenu ? 🧠</h3>
    <textarea id="enep-postit-text" rows="4" style="width: 100%; margin-bottom: 10px; box-sizing: border-box;"
      placeholder="écris un résumé rapide, ou ferme si c'est juste de la musique..."></textarea>
    <button id="enep-postit-save" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Valider</button>
  `;

  document.body.appendChild(postit);

  document.getElementById('enep-postit-close').addEventListener('click', () => {
    postit.remove();
  });

  document.getElementById('enep-postit-save').addEventListener('click', () => {
    const text = document.getElementById('enep-postit-text').value.trim();

    // Rien écrit (ex: c'était de la musique) -> on ferme simplement, pas de sauvegarde
    if (!text) {
      postit.remove();
      return;
    }

    const videoId = getVideoId();
    const titre = document.title.replace(' - YouTube', '');

    browser.storage.local.get({ notes: {} }).then((data) => {
      const notes = data.notes;
      notes[videoId] = {
        date: new Date().toISOString(),
        url: window.location.href,
        title: titre,
        content: text
      };
      return browser.storage.local.set({ notes });
    }).then(() => {
      postit.remove();
    });
  });
}

// --- Suivi des changements de page (YouTube est une SPA) ---

function onNavigation() {
  reinitialiserPourNouvelleVideo();
  attacherVideo();
}

window.addEventListener('yt-navigate-finish', onNavigation);
setInterval(attacherVideo, 1000); // filet de sécurité si le <video> est recréé sans déclencher l'event

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onNavigation);
} else {
  onNavigation();
}