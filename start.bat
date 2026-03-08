@echo off
echo Starting YTDL Backend...
start "YTDL Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Starting YTDL Frontend...
start "YTDL Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both servers started.
