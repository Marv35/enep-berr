document.addEventListener("DOMContentLoaded", chargerNotes);

function chargerNotes() {
  browser.storage.local.get({ notes: {} }).then((data) => {
    const notes = data.notes;
    const entries = Object.entries(notes).sort(
      (a, b) => new Date(b[1].date) - new Date(a[1].date)
    );

    const list = document.getElementById("notesList");
    const empty = document.getElementById("emptyState");
    list.innerHTML = "";

    if (entries.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    entries.forEach(([videoId, note]) => {
      list.appendChild(creerCarteNote(videoId, note));
    });
  });
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function creerCarteNote(videoId, note) {
  const li = document.createElement("li");
  li.className = "note-card";

  const titre = document.createElement("a");
  titre.className = "note-title";
  titre.href = note.url || `https://www.youtube.com/watch?v=${videoId}`;
  titre.target = "_blank";
  titre.rel = "noopener noreferrer";
  titre.textContent = note.title || "Vidéo YouTube";

  const date = document.createElement("span");
  date.className = "note-date";
  date.textContent = formatDate(note.date);

  const contenu = document.createElement("p");
  contenu.className = "note-content";
  contenu.textContent = note.content;

  const supprimer = document.createElement("button");
  supprimer.type = "button";
  supprimer.className = "note-delete";
  supprimer.setAttribute("aria-label", "Supprimer cette note");
  supprimer.textContent = "✕";
  supprimer.addEventListener("click", () => supprimerNote(videoId));

  li.append(titre, date, contenu, supprimer);
  return li;
}

function supprimerNote(videoId) {
  browser.storage.local.get({ notes: {} }).then((data) => {
    const notes = data.notes;
    delete notes[videoId];
    return browser.storage.local.set({ notes });
  }).then(chargerNotes);
}