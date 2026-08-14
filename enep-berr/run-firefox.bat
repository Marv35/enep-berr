@echo off
title Lancement Firefox - ENEP-BERR
chcp 65001 > nul

set "DIR=%~dp0"
set "DIR=%DIR:~0,-1%"

:: Vérification de la présence de npx / Node.js
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js / npx n'est pas installe sur votre systeme.
    echo Telecharge Node.js sur https://nodejs.org puis relance ce script.
    echo.
    echo Methode manuelle :
    echo 1. Ouvre about:debugging#/runtime/this-firefox dans Firefox.
    echo 2. Clique sur "Charger un module complementaire temporaire...".
    echo 3. Selectionne le fichier manifest.json dans : %DIR%
    echo.
    pause
    exit /b 1
)

echo Lancement de Firefox avec ENEP-BERR via web-ext...
call npx web-ext run --source-dir="%DIR%"