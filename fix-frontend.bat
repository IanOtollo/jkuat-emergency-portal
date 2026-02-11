@echo off
echo Fixing frontend configuration...

cd frontend

echo Creating index.html...
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

echo Creating main.jsx...
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

echo Removing default files...
del /q src\main.ts 2>nul
del /q src\counter.ts 2>nul
del /q src\typescript.svg 2>nul
del /q src\style.css 2>nul
del /q src\vite-env.d.ts 2>nul

cd ..

echo.
echo Frontend fixed! Restart your dev server:
echo   cd frontend
echo   npm run dev
echo.
pause
