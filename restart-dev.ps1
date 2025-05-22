Write-Host ""
Write-Host "----------------------------------------------"
Write-Host " BaseClean - Dev Environment with Clean Cache"
Write-Host "----------------------------------------------"
Write-Host ""
Write-Host "This script will clear local storage cache and restart the development server."
Write-Host ""
Write-Host "[i] Visit http://localhost:3000/debug to access the debugging tools."
Write-Host "[i] Use the debug page to clear token logo cache and test image loading."
Write-Host ""

# Stop any running Next.js processes
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "[✓] Stopped running Node.js processes"
} catch {
    Write-Host "[i] No Node.js processes were running"
}

# Remove Next.js cache
if (Test-Path -Path ".\.next") {
    Remove-Item -Path ".\.next" -Recurse -Force
    Write-Host "[✓] Removed Next.js cache"
}

# Start the development server
Write-Host "[i] Starting development server..."
Write-Host "[i] Remember to clear your browser cache if needed (Ctrl+Shift+Delete)"
Write-Host ""
npm run dev 