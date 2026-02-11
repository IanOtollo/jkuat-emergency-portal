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
npm install --legacy-peer-deps
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
