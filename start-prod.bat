@echo off
set DIST=%~dp0frontend\dist
set REBUILD=0

if not exist "%DIST%" (
  set REBUILD=1
  goto CHECK_DONE
)

:: Use PowerShell to check if any src file is newer than the dist folder
for /f "delims=" %%R in ('powershell -NoProfile -Command "$src=\"%~dp0frontend\src\"; $dist=\"%DIST%\"; $distTime=(Get-Item $dist).LastWriteTime; $newer=Get-ChildItem $src -Recurse -File | Where-Object {$_.LastWriteTime -gt $distTime}; if($newer){\"1\"}else{\"0\"}"') do set REBUILD=%%R

:CHECK_DONE
if "%REBUILD%"=="1" (
  echo [1/2] Changes detected. Building frontend...
  goto BUILD
)
echo [1/2] No changes detected. Skipping build.
goto START

:BUILD
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
  echo Frontend build failed!
  pause
  exit /b 1
)

:START
echo [2/2] Starting server...
cd /d "%~dp0backend"
set NODE_ENV=production
start "" "http://localhost:3001"
node server.js
