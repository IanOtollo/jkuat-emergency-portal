#!/usr/bin/env bash
# exit on error
set -o errexit

# Clean previous builds
echo "Cleaning old builds..."
rm -rf frontend/dist
rm -rf backend/staticfiles

# Install Frontend Dependencies and Build
echo "Building Frontend..."
cd frontend
# Set memory limit for Node/Vite to avoid OOM
export NODE_OPTIONS="--max-old-space-size=512"
npm install --legacy-peer-deps --no-audit --no-fund
npm run build
cd ..

# Install Backend Dependencies
echo "Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt

# Create Static Files
echo "Preparing Backend..."
python manage.py collectstatic --no-input
cd ..
