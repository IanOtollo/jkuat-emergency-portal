#!/bin/bash
# EMERGENCY FRONTEND FIX - Run this to fix everything at once

echo "🚨 EMERGENCY FIX FOR FRONTEND"
echo "================================"
echo ""

# Stop if not in frontend directory
if [ ! -f "package.json" ]; then
    echo "ERROR: Run this from the frontend directory!"
    echo "cd ~/Downloads/jkuat-incident-system.tar/jkuat-incident-system/frontend"
    exit 1
fi

echo "Step 1: Creating index.html..."
cat > index.html << 'HTMLEOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JKUAT Security Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
HTMLEOF

echo "Step 2: Creating src/main.jsx..."
cat > src/main.jsx << 'JSXEOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
JSXEOF

echo "Step 3: Creating vite.config.js..."
cat > vite.config.js << 'VITEEOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  }
})
VITEEOF

echo "Step 4: Fixing package.json..."
cat > package.json << 'PKGEOF'
{
  "name": "jkuat-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "lucide-react": "^0.309.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
PKGEOF

echo "Step 5: Cleaning old files..."
rm -rf node_modules package-lock.json
rm -f src/main.ts src/counter.ts src/typescript.svg src/style.css src/vite-env.d.ts 2>/dev/null

echo "Step 6: Installing dependencies (this takes 1-2 minutes)..."
npm install

echo ""
echo "================================"
echo "✅ FIX COMPLETE!"
echo "================================"
echo ""
echo "Now run: npm run dev"
echo "Then visit: http://localhost:5173"
echo ""
