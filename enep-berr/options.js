const DEFAULTS = { maxReels: 10, maxShorts: 10, blockShorts: false };

const reelsInput = document.getElementById("maxReels");
const shortsInput = document.getElementById("maxShorts");
const blockToggle = document.getElementById("blockShortsToggle");
const status = document.getElementById("status");
let statusTimer = null;

// Charger les valeurs existantes au lancement
document.addEventListener("DOMContentLoaded", () => {
  browser.storage.local.get(DEFAULTS).then((result) => {
    reelsInput.value = result.maxReels;
    shortsInput.value = result.maxShorts;
    setToggle(result.blockShorts);
  });
});

function showStatus(text) {
  status.textContent = text;
  status.classList.add("show");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove("show"), 2000);
}

function clamp(input, value) {
  const min = parseInt(input.min, 10);
  const max = parseInt(input.max, 10);
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function wireStepper(input, decBtn, incBtn) {
  document.getElementById(decBtn).addEventListener("click", () => {
    input.value = clamp(input, (parseInt(input.value, 10) || 0) - 1);
  });
  document.getElementById(incBtn).addEventListener("click", () => {
    input.value = clamp(input, (parseInt(input.value, 10) || 0) + 1);
  });
  input.addEventListener("change", () => {
    input.value = clamp(input, parseInt(input.value, 10));
  });
}

wireStepper(reelsInput, "decReelsBtn", "incReelsBtn");
wireStepper(shortsInput, "decShortsBtn", "incShortsBtn");

// --- Interrupteur "bloquer les Shorts entièrement" ---
function setToggle(checked) {
  blockToggle.setAttribute("aria-checked", String(checked));
  shortsInput.disabled = checked;
  document.getElementById("decShortsBtn").disabled = checked;
  document.getElementById("incShortsBtn").disabled = checked;
}

blockToggle.addEventListener("click", () => {
  const next = blockToggle.getAttribute("aria-checked") !== "true";
  setToggle(next);
});

// --- Compteurs du jour + reset ---
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function normaliserJour(data) {
  const today = getTodayDateString();
  if (!data || data.date !== today) return { date: today, count: 0 };
  return data;
}

function afficherCompteurs() {
  browser.storage.local.get({
    maxReels: DEFAULTS.maxReels,
    maxShorts: DEFAULTS.maxShorts,
    dailyReels: { date: getTodayDateString(), count: 0 },
    dailyShorts: { date: getTodayDateString(), count: 0 }
  }).then((result) => {
    const reels = normaliserJour(result.dailyReels);
    const shorts = normaliserJour(result.dailyShorts);
    document.getElementById("reelsCounterValue").textContent = `${reels.count} / ${result.maxReels}`;
    document.getElementById("shortsCounterValue").textContent = `${shorts.count} / ${result.maxShorts}`;
  });
}

function reinitialiserCompteur(cle) {
  const data = { date: getTodayDateString(), count: 0 };
  browser.storage.local.set({ [cle]: data }).then(() => {
    afficherCompteurs();
    showStatus("Compteur remis à zéro ✓");
  });
}

document.getElementById("resetReelsBtn").addEventListener("click", () => reinitialiserCompteur("dailyReels"));
document.getElementById("resetShortsBtn").addEventListener("click", () => reinitialiserCompteur("dailyShorts"));

document.addEventListener("DOMContentLoaded", afficherCompteurs);

// Se met à jour aussi si les compteurs bougent pendant que la page est ouverte
// (ex: tu regardes un Short dans un autre onglet)
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.dailyReels || changes.dailyShorts || changes.maxReels || changes.maxShorts) {
    afficherCompteurs();
  }
});

// Sauvegarder les réglages
document.getElementById("saveBtn").addEventListener("click", () => {
  const maxReels = clamp(reelsInput, parseInt(reelsInput.value, 10));
  const maxShorts = clamp(shortsInput, parseInt(shortsInput.value, 10));
  const blockShorts = blockToggle.getAttribute("aria-checked") === "true";

  reelsInput.value = maxReels;
  shortsInput.value = maxShorts;

  browser.storage.local.set({ maxReels, maxShorts, blockShorts }).then(() => {
    showStatus("Paramètres sauvegardés ✓");
  });
});