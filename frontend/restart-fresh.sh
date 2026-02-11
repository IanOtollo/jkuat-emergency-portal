#!/bin/bash
echo "========================================"
echo "CLEAR CACHE AND RESTART"
echo "========================================"
echo ""

echo "Step 1: Clearing Vite cache..."
rm -rf node_modules/.vite dist

echo "Step 2: Starting dev server..."
echo ""
echo "========================================"
echo "IMPORTANT: After server starts"
echo "========================================"
echo "1. CLOSE ALL BROWSER WINDOWS"
echo "2. Open browser in INCOGNITO/PRIVATE mode"
echo "3. Go to: http://localhost:5173"
echo "========================================"
echo ""

npm run dev
