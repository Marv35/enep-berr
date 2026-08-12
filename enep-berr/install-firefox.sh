#!/usr/bin/env bash
#
# Important : Firefox garde cette extension en mode "temporaire" — elle
# disparaît à la fermeture de cette fenêtre. Relance ce script pour la
# recharger. Ce n'est pas une limite du script : Firefox l'impose pour
# toute extension non signée par Mozilla.


# A REVOIR !!!! 
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v npx >/dev/null 2>&1; then
  echo "npm/npx n'est pas installé."
  echo "Installe Node.js (https://nodejs.org) puis relance ce script."
  echo ""
  echo "Sinon, méthode manuelle : about:debugging#/runtime/this-firefox ->"
  echo "'Charger un module complémentaire temporaire' -> sélectionne manifest.json dans $DIR"
  exit 1
fi

echo "Lancement de Firefox avec ENEP-BERR (via web-ext) ..."
npx web-ext run --source-dir="$DIR"