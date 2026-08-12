let toutesLesNotes = []; // cache en mémoire pour filtrer sans re-lire le storage

document.addEventListener("DOMContentLoaded", () => {
  chargerNotes();
  document.getElementById("searchInput").addEventListener("input", (e) => {
    afficherListe(filtrer(toutesLesNotes, e.target.value));
  });
});

function chargerNotes() {
  return browser.storage.local.get({ notes: {} }).then((data) => {
    toutesLesNotes = Object.entries(data.notes).sort(
      (a, b) => new Date(b[1].date) - new Date(a[1].date)
    );
    const query = document.getElementById("searchInput").value;
    afficherListe(filtrer(toutesLesNotes, query));
  });
}

function filtrer(entries, query) {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(([, note]) =>
    (note.title || "").toLowerCase().includes(q) ||
    (note.content || "").toLowerCase().includes(q)
  );
}

function afficherListe(entries) {
  const list = document.getElementById("notesList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (toutesLesNotes.length === 0) {
    empty.hidden = false;
    empty.querySelector("p").textContent = "Aucune note pour l'instant.";
    return;
  }
  if (entries.length === 0) {
    empty.hidden = false;
    empty.querySelector("p").textContent = "Aucune note ne correspond à ta recherche.";
    return;
  }
  empty.hidden = true;

  entries.forEach(([videoId, note]) => {
    list.appendChild(creerCarteNote(videoId, note));
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

  const actions = document.createElement("div");
  actions.className = "note-actions";

  const modifier = document.createElement("button");
  modifier.type = "button";
  modifier.className = "note-icon-btn";
  modifier.setAttribute("aria-label", "Modifier cette note");
  modifier.textContent = "✎";
  modifier.addEventListener("click", () => passerEnEdition(li, videoId, note));

  const supprimer = document.createElement("button");
  supprimer.type = "button";
  supprimer.className = "note-icon-btn note-icon-btn--danger";
  supprimer.setAttribute("aria-label", "Supprimer cette note");
  supprimer.textContent = "✕";
  supprimer.addEventListener("click", () => supprimerNote(videoId));

  actions.append(modifier, supprimer);

  const titre = document.createElement("a");
  titre.className = "note-title";
  titre.href = note.url || `https://www.youtube.com/watch?v=${videoId}`;
  titre.target = "_blank";
  titre.rel = "noopener noreferrer";
  titre.textContent = note.title || "Vidéo YouTube";

  const date = document.createElement("span");
  date.className = "note-date";
  date.textContent = note.edited
    ? `${formatDate(note.date)} · modifiée le ${formatDate(note.edited)}`
    : formatDate(note.date);

  const contenu = document.createElement("p");
  contenu.className = "note-content";
  contenu.textContent = note.content;

  li.append(actions, titre, date, contenu);
  return li;
}

function passerEnEdition(li, videoId, note) {
  li.innerHTML = "";
  li.classList.add("note-card--editing");

  const titre = document.createElement("p");
  titre.className = "note-title";
  titre.style.textDecoration = "none";
  titre.textContent = note.title || "Vidéo YouTube";

  const textarea = document.createElement("textarea");
  textarea.className = "note-edit-textarea";
  textarea.rows = 4;
  textarea.value = note.content;

  const boutons = document.createElement("div");
  boutons.className = "note-edit-actions";

  const annuler = document.createElement("button");
  annuler.type = "button";
  annuler.className = "note-cancel-btn";
  annuler.textContent = "Annuler";
  annuler.addEventListener("click", () => {
    li.classList.remove("note-card--editing");
    li.replaceWith(creerCarteNote(videoId, note));
  });

  const enregistrer = document.createElement("button");
  enregistrer.type = "button";
  enregistrer.className = "note-save-btn";
  enregistrer.textContent = "Enregistrer";
  enregistrer.addEventListener("click", () => {
    const nouveauContenu = textarea.value.trim();
    if (!nouveauContenu) {
      textarea.focus();
      return;
    }
    enregistrerModification(videoId, nouveauContenu);
  });

  boutons.append(annuler, enregistrer);
  li.append(titre, textarea, boutons);
  textarea.focus();
}

function enregistrerModification(videoId, nouveauContenu) {
  browser.storage.local.get({ notes: {} }).then((data) => {
    const notes = data.notes;
    if (!notes[videoId]) return;
    notes[videoId].content = nouveauContenu;
    notes[videoId].edited = new Date().toISOString();
    return browser.storage.local.set({ notes });
  }).then(chargerNotes);
}

function supprimerNote(videoId) {
  browser.storage.local.get({ notes: {} }).then((data) => {
    const notes = data.notes;
    delete notes[videoId];
    return browser.storage.local.set({ notes });
  }).then(chargerNotes);
}