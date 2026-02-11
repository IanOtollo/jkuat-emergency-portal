#!/bin/bash
echo "Fixing frontend configuration..."

cd frontend

# Update index.html
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

# Update main.jsx
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

# Remove default Vite files
cd src
rm -f main.ts counter.ts typescript.svg style.css vite-env.d.ts 2>/dev/null
cd ..

echo "Frontend fixed! Restart your dev server:"
echo "  npm run dev"
