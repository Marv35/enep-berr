# ENEP-BERR

Extension de navigateur qui limite le temps passé sur les Shorts YouTube et
les Reels Instagram, et propose un petit résumé à retenir avant la fin
d'une vidéo YouTube classique.

## Fonctionnalités

- **Quota quotidien** réglable séparément pour les Shorts et les Reels
- **Blocage total** des Shorts (option), indépendant du quota
- **Compteurs du jour** visibles et réinitialisables depuis la page de réglages
- **Post-it de rappel** : deux minute avant la fin d'une vidéo YouTube, une
  note s'affiche pour écrire ce que tu en as retenu (ignorable en un clic)
- **Page de notes** : relecture, modification et recherche dans tes notes

## Roadmap

- [x] YouTube Shorts — quota, blocage total, masquage, redirection
- [x] Instagram Reels — quota, masquage, redirection
- [x] Page de réglages (options) avec compteurs et réinitialisation
- [x] Prise de notes sur les vidéos YouTube classiques
- [ ] TikTok — même principe de quota/masquage
- [ ] Export des notes (`.txt` / `.json`)
- [ ] Historique des jours précédents, pas juste le compteur du jour

## Installation

Cette extension n'est pas publiée sur les stores officiels — elle
s'installe manuellement, en mode développeur.

### Firefox

1. Télécharge et dézippe cette extension (ou clone le repo)
2. Ouvre `about:debugging#/runtime/this-firefox`
3. Clique sur **Charger un module complémentaire temporaire**
4. Sélectionne le fichier `manifest.json` dans le dossier de l'extension

⚠️ En mode temporaire, Firefox désinstalle l'extension à chaque
redémarrage du navigateur — il faudra recharger le module à chaque fois,
ou passer par une installation signée si tu veux quelque chose de permanent.

### Chrome / Edge / Brave (navigateurs à base de Chromium)

1. Télécharge et dézippe cette extension (ou clone le repo)
2. Ouvre `chrome://extensions`
3. Active le **Mode développeur** (en haut à droite)
4. Clique sur **Charger l'extension non empaquetée**
5. Sélectionne le dossier de l'extension (celui qui contient `manifest.json`)

## Réglages

Une fois installée, clique sur l'icône de l'extension puis sur
**Options** (ou fais un clic droit dessus → *Gérer l'extension* →
*Options de l'extension*) pour régler les quotas et consulter tes notes.

## Structure du projet

```
enep-berr/
├── manifest.json              # déclaration de l'extension
├── content-youtube.js         # limite les Shorts YouTube
├── content-instagram.js       # limite les Reels Instagram
├── content-youtube-notes.js   # post-it de fin de vidéo
├── options.html / .js         # page de réglages
├── notes.html / .js           # page de relecture des notes
└── style.css / notes.css      # habillage visuel commun
```

## Permissions utilisées

- `storage` : pour sauvegarder les réglages, les compteurs et les notes
  localement, dans le navigateur — rien n'est envoyé où que ce soit.
