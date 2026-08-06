// Changer les valeurs existantes au lancement 
document.addEventListener("DOMContentLoaded", () => {
    browser.storage.local.get({maxReels: 10}).then((result) => {
        document.getElementById("maxReels").value = result.maxReels;
    });
});

// Sauvegarder la nouvelle valeur 
document.getElementById('saveBtn').addEventListener('click', () => {
    const count = parseInt(document.getElementById("maxReels").value, 10);
    browser.storage.local.set({maxReels: count}).then(() => {
        alert("Paramètres sauvegardés !");
    });
});
