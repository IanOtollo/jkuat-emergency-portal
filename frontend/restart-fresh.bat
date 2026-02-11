@echo off
echo ========================================
echo CLEAR CACHE AND RESTART
echo ========================================
echo.

echo Step 1: Killing any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2

echo Step 2: Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist

echo Step 3: Starting dev server...
echo.
echo ========================================
echo IMPORTANT: After server starts
echo ========================================
echo 1. CLOSE ALL BROWSER WINDOWS
echo 2. Open browser in INCOGNITO/PRIVATE mode
echo 3. Go to: http://localhost:5173
echo ========================================
echo.
echo Starting server now...
echo.

npm run dev
