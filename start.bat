@echo off
echo 🏋️ Gym Tracker Pro - Avvio Rapido
echo.

REM Controlla se Node.js è installato
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non trovato!
    echo 📥 Scarica Node.js da: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js trovato
echo.

REM Installa dipendenze se non esistono
if not exist "node_modules" (
    echo 📦 Installazione dipendenze...
    npm install
    echo.
)

echo 🚀 Avvio del server...
echo 🌐 L'app sarà disponibile su: http://localhost:3000
echo.
echo 💡 Premi Ctrl+C per fermare il server
echo.

npm start