@echo off
title BaseClean - Quick Restart

echo.
echo ===============================================
echo   ⚡ BaseClean - Quick Dev Server Restart
echo ===============================================
echo.
echo This script will quickly restart your dev server:
echo   • Stop running Node.js processes
echo   • Clear Next.js cache
echo   • Restart development server
echo.
echo (No dependency reinstallation - faster restart)
echo.

REM Stop any running Node.js processes
echo [1/3] 🛑 Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo      ✅ Stopped running Node.js processes
) else (
    echo      ℹ️  No Node.js processes were running
)

REM Remove Next.js cache
echo [2/3] 🗑️  Clearing Next.js cache...
if exist .\.next (
    rmdir /s /q .\.next
    echo      ✅ Removed .next directory
) else (
    echo      ℹ️  No .next directory found
)

REM Start the development server
echo [3/3] 🚀 Starting development server...
echo.
echo ===============================================
echo   📍 Server will be available at:
echo      http://localhost:3000
echo.
echo   🐛 Debug tools at:
echo      http://localhost:3000/debug
echo.
echo   💡 Press Ctrl+C to stop the server
echo ===============================================
echo.
echo Starting server...

npm run dev 