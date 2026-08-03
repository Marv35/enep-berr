# ENEP-BERR — Extension de Friction Progressive pour Réseaux Sociaux

**ENEP-BERR** est une extension web cross-browser (compatible **Firefox** et **Chrome** en Manifest V3) conçue pour lutter contre le défilement infini (*doomscrolling*) et la surconsommation de formats courts (Shorts, Reels).

L'extension applique un principe de **friction progressive** : elle limite le nombre de contenus vus par session et finit par bloquer complètement l'accès pour la journée une fois le quota quotidien atteint.

---

## 🎯 Fonctionnalités actuelles (YouTube Shorts)

- 🛑 **Quota par session** : Autorise la visualisation d'un nombre restreint de Shorts (ex: 2 Shorts max, soit 1 seul scroll). Dès que la limite est dépassée, l'utilisateur est automatiquement redirigé vers Google.
- 📅 **Quota quotidien** : Limite le nombre de sessions autorisées par jour (ex: 2 sessions par jour).
- 🚫 **Masquage dynamique du DOM** : Une fois le quota quotidien atteint :
  - Les carrousels / étagères de Shorts disparaissent de l'accueil et des recherches.
  - Les liens vers les Shorts dans la barre de navigation latérale sont masqués.
  - Tout accès direct à une URL `/shorts/` redirige instantanément vers Google.
- 🔄 **Réinitialisation automatique** : Le compteur se remet à zéro chaque jour à minuit.
- 🛠️ **Architecture légère** : Fonctionne sans script d'arrière-plan lourd (*background script*), directement via un script de contenu (*content script*) optimisé.

---

## 🗺️ Feuille de route & Évolutions (Roadmap)

Le projet a vocation à devenir une suite globale de contrôle d'attention pour l'ensemble des plateformes à défilement infini :

- [x] **YouTube Shorts** (Actif) — Gestion des quotas, masquage des carrousels et redirection.
- [ ] **Instagram Reels** — Interception des URLs `/reels/`, blocage de l'onglet Reels et masquage des suggestions.
- [ ] **Panneau de configuration (Popup)** — Interface utilisateur pour ajuster les limites (nombre de vidéos, sessions) sans modifier le code source.

---

## 📁 Structure du projet

```text
ENEP-BER/
├── manifest.json   # Configuration V3 compatible Firefox & Chrome
└── content.js      # Script principal (gestion des quotas, URLs et DOM)
