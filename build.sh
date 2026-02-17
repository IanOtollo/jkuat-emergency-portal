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
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

# Detect pip command
if command -v pip3 &> /dev/null; then
    PIP_CMD="pip3"
elif command -v pip &> /dev/null; then
    PIP_CMD="pip"
else
    PIP_CMD="$PYTHON_CMD -m pip"
fi

echo "Using $PYTHON_CMD and $PIP_CMD"
$PIP_CMD install -r requirements.txt

# Create Static Files
echo "Preparing Backend..."
# We are already in the backend directory from the previous step
$PYTHON_CMD manage.py collectstatic --no-input
# We run migrations in the start command, but we can verify here if needed
cd ..
