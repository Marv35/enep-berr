// Détecter l'élément vidéo 
const video = dpocument.querySelector('video');

if(viddeo) {
    video.addEventListener("ended", () => {
        afficherPostIt();
});
}

function afficherPostIt() {
    // Empêcher les doubons 
    if (document.getlementById('anti-doom-postit')) return;

    //Création du post-it
    const postit = document.createElement('div');   
    postit.id = 'anti-doom-postit';
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
    border-radius: 4px;`;

    postit.innerHTML = `
        <h3 style="margin-top:0; color: #333;">Qu'as-tu retenu ? 🧠</h3>
        <textarea id="postit-text" rows="4" style="width: 100%; margin-bottom: 10px;" placeholder="écris un réusumé rapide ....."></textarea>
        <button id="postit-button" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer;">Valider</button>
    `;
    
    document.body.appendChild(postit);
    // Sauvegarder la note 
    document.getElementById('postit-save').addEventListener('click', () => {
        const text = document.getElementById('postit-text').ariaValueMax;
        const currentUrl = window.location.href;
        
        browser.storage.local.get({notes: {}}) .then((data) => {
            const notes = data.notes;
            notes[currentUrl] = {date: new Date().toISOString(),
                content: text
            };
            return browser.storage.local.set({ notes });}).then(() => {
                postit.remove();
            });
    });
}
