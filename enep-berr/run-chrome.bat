@echo off
title Lancement Chrome - ENEP-BERR
chcp 65001 > nul

:: Récupère le dossier courant du script
set "DIR=%~dp0"
:: Enlève l'anti-slash final
set "DIR=%DIR:~0,-1%"

set "BROWSER="

:: Vérification des chemins d'installation classiques de Chrome / Edge / Brave
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)

if "%BROWSER%"=="" (
    echo [ERREUR] Aucun navigateur Chromium (Chrome/Edge) n'a ete trouve automatiquement.
    echo.
    echo Methode manuelle :
    echo 1. Ouvre chrome://extensions dans ton navigateur.
    echo 2. Active le Mode developpeur (en haut a droite).
    echo 3. Clique sur "Charger l'extension non empaquetee" et selectionne : %DIR%
    echo.
    pause
    exit /b 1
)

echo Lancement de Chrome avec l'extension ENEP-BERR depuis :
echo %DIR%
echo.

start "" "%BROWSER%" --load-extension="%DIR%"   