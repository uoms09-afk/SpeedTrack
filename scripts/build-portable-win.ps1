Write-Host "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Building SpeedTrack portable EXE..."
npm run build:win
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Check dist/ for the portable .exe"
