function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function normaliserJour(data) {
  const today = getTodayDateString();
  if (!data || data.date !== today) return { date: today, count: 0 };
  return data;
}

function afficherEtat() {
  browser.storage.local.get({
    maxShorts: 10,
    maxReels: 10,
    blockShorts: false,
    dailyShorts: { date: getTodayDateString(), count: 0 },
    dailyReels: { date: getTodayDateString(), count: 0 }
  }).then((result) => {
    const shorts = normaliserJour(result.dailyShorts);
    const reels = normaliserJour(result.dailyReels);

    document.getElementById("shortsValue").textContent =
      result.blockShorts ? "bloqués" : `${shorts.count} / ${result.maxShorts}`;
    document.getElementById("reelsValue").textContent = `${reels.count} / ${result.maxReels}`;

    const toggle = document.getElementById("blockShortsToggle");
    toggle.setAttribute("aria-checked", String(result.blockShorts));
  });
}

document.addEventListener("DOMContentLoaded", afficherEtat);

// Se met à jour si un compteur bouge pendant que le popup est ouvert
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.dailyShorts || changes.dailyReels || changes.maxShorts || changes.maxReels || changes.blockShorts) {
    afficherEtat();
  }
});

document.getElementById("blockShortsToggle").addEventListener("click", () => {
  browser.storage.local.get({ blockShorts: false }).then((result) => {
    return browser.storage.local.set({ blockShorts: !result.blockShorts });
  }).then(afficherEtat);
});

document.getElementById("openOptionsBtn").addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

document.getElementById("openNotesBtn").addEventListener("click", () => {
  browser.tabs.create({ url: browser.runtime.getURL("notes.html") });
});