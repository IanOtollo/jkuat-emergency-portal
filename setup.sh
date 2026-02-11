#!/bin/bash

echo "========================================"
echo "JKUAT Incident System - Setup"
echo "========================================"
echo ""

echo "[1/4] Installing Backend Dependencies..."
cd backend
pip install django djangorestframework django-cors-headers pillow djangorestframework-simplejwt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    echo "Try: pip3 install django djangorestframework django-cors-headers pillow djangorestframework-simplejwt"
    exit 1
fi

echo ""
echo "[2/4] Setting up Database..."
python manage.py migrate || python3 manage.py migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Database migration failed"
    exit 1
fi

echo ""
echo "[3/4] Creating Sample Data..."
python manage.py seed_data || python3 manage.py seed_data
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to seed data"
    exit 1
fi

cd ..

echo ""
echo "[4/4] Installing Frontend Dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  python manage.py runserver"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Login: admin / admin123"
echo "Frontend: http://localhost:5173"
echo ""
