@echo off
echo.
echo ----------------------------------------------
echo  BaseClean - Dev Environment with Clean Cache
echo ----------------------------------------------
echo.
echo This script will clear local storage cache and restart the development server.
echo.
echo [i] Visit http://localhost:3000/debug to access the debugging tools.
echo [i] Use the debug page to clear token logo cache and test image loading.
echo.

REM Stop any running Node.js processes
taskkill /f /im node.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [v] Stopped running Node.js processes
) else (
    echo [i] No Node.js processes were running
)

REM Remove Next.js cache
if exist .\.next (
    rmdir /s /q .\.next
    echo [v] Removed Next.js cache
)

REM Start the development server
echo [i] Starting development server...
echo [i] Remember to clear your browser cache if needed (Ctrl+Shift+Delete)
echo.
npm run dev 