@echo off
echo ========================================
echo EMERGENCY FRONTEND FIX
echo ========================================
echo.

if not exist package.json (
    echo ERROR: Run this from the frontend directory!
    echo cd C:\Users\PC\Downloads\jkuat-incident-system.tar\jkuat-incident-system\frontend
    pause
    exit /b 1
)

echo Step 1: Creating index.html...
(
echo ^<!doctype html^>
echo ^<html lang="en"^>
echo   ^<head^>
echo     ^<meta charset="UTF-8" /^>
echo     ^<link rel="icon" type="image/svg+xml" href="/vite.svg" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
echo     ^<title^>JKUAT Security Portal^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<div id="root"^>^</div^>
echo     ^<script type="module" src="/src/main.jsx"^>^</script^>
echo   ^</body^>
echo ^</html^>
) > index.html

echo Step 2: Creating src\main.jsx...
(
echo import React from 'react'
echo import ReactDOM from 'react-dom/client'
echo import App from './App.jsx'
echo import './App.css'
echo.
echo ReactDOM.createRoot^(document.getElementById^('root'^)^).render^(
echo   ^<React.StrictMode^>
echo     ^<App /^>
echo   ^</React.StrictMode^>,
echo ^)
) > src\main.jsx

echo Step 3: Creating vite.config.js...
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig^({
echo   plugins: [react^(^)],
echo   server: {
echo     port: 5173,
echo   }
echo }^)
) > vite.config.js

echo Step 4: Creating package.json...
(
echo {
echo   "name": "jkuat-frontend",
echo   "private": true,
echo   "version": "0.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "vite build",
echo     "preview": "vite preview"
echo   },
echo   "dependencies": {
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "react-router-dom": "^6.21.0",
echo     "@tanstack/react-query": "^5.17.0",
echo     "axios": "^1.6.5",
echo     "lucide-react": "^0.309.0",
echo     "recharts": "^2.10.3"
echo   },
echo   "devDependencies": {
echo     "@types/react": "^18.2.43",
echo     "@types/react-dom": "^18.2.17",
echo     "@vitejs/plugin-react": "^4.2.1",
echo     "vite": "^5.0.8"
echo   }
echo }
) > package.json

echo Step 5: Cleaning old files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
if exist src\main.ts del /q src\main.ts
if exist src\counter.ts del /q src\counter.ts
if exist src\typescript.svg del /q src\typescript.svg
if exist src\style.css del /q src\style.css
if exist src\vite-env.d.ts del /q src\vite-env.d.ts

echo.
echo Step 6: Installing dependencies (1-2 minutes)...
call npm install

echo.
echo ========================================
echo FIX COMPLETE!
echo ========================================
echo.
echo Now run: npm run dev
echo Then visit: http://localhost:5173
echo.
pause
