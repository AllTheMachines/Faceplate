@echo off
title Faceplate - Starting...
cd /d "%~dp0"

echo.
echo  =============================================
echo   Faceplate UI Designer
echo  =============================================
echo.
echo  Starting local server...
echo.

:: Try Python first (most common)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  Opening http://localhost:8000
    echo  Press Ctrl+C to stop the server
    echo.
    start "" "http://localhost:8000"
    python -m http.server 8000
    goto :end
)

:: Try Python3
where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  Opening http://localhost:8000
    echo  Press Ctrl+C to stop the server
    echo.
    start "" "http://localhost:8000"
    python3 -m http.server 8000
    goto :end
)

:: Try Node.js with npx serve
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  Opening http://localhost:3000
    echo  Press Ctrl+C to stop the server
    echo.
    start "" "http://localhost:3000"
    npx serve -s . -l 3000
    goto :end
)

:: No server found
echo.
echo  ERROR: No web server found!
echo.
echo  Please install one of these:
echo    - Python: https://www.python.org/downloads/
echo    - Node.js: https://nodejs.org/
echo.
pause

:end
