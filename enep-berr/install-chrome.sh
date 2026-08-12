#!/usr/bin/env bash
# Lance Chrome (ou un navigateur Chromium) avec ENEP-BERR chargée automatiquement.
#
# Important : ceci n'est PAS une installation permanente. Les navigateurs
# interdisent volontairement l'installation silencieuse d'extensions en
# dehors de leurs stores officiels. L'extension reste chargée tant que ce
# lancement de Chrome reste ouvert ; ferme-le et relance ce script pour
# la retrouver.

# A REVOIR !!!!!!!

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BROWSER=""
for candidate in google-chrome google-chrome-stable chromium chromium-browser \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium"; do
  if command -v "$candidate" >/dev/null 2>&1; then
    BROWSER="$candidate"
    break
  elif [ -x "$candidate" ]; then
    BROWSER="$candidate"
    break
  fi
done

if [ -z "$BROWSER" ]; then
  echo "Aucun navigateur Chrome/Chromium trouvé automatiquement."
  echo "Méthode manuelle : ouvre chrome://extensions, active le Mode développeur,"
  echo "puis 'Charger l'extension non empaquetée' et sélectionne : $DIR"
  exit 1
fi

echo "Lancement de $BROWSER avec ENEP-BERR chargée depuis $DIR ..."
"$BROWSER" --load-extension="$DIR" >/dev/null 2>&1 &