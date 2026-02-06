#!/bin/bash
cd "$(dirname "$0")"

echo ""
echo "============================================="
echo " Faceplate UI Designer"
echo "============================================="
echo ""
echo " Starting local server..."
echo ""

# Try Python 3 first
if command -v python3 &> /dev/null; then
    echo " Opening http://localhost:8000"
    echo " Press Ctrl+C to stop the server"
    echo ""
    open "http://localhost:8000"
    python3 -m http.server 8000
    exit 0
fi

# Try Python
if command -v python &> /dev/null; then
    echo " Opening http://localhost:8000"
    echo " Press Ctrl+C to stop the server"
    echo ""
    open "http://localhost:8000"
    python -m http.server 8000
    exit 0
fi

# Try Node.js
if command -v npx &> /dev/null; then
    echo " Opening http://localhost:3000"
    echo " Press Ctrl+C to stop the server"
    echo ""
    open "http://localhost:3000"
    npx serve -s . -l 3000
    exit 0
fi

echo ""
echo " ERROR: No web server found!"
echo ""
echo " Please install Python or Node.js"
echo ""
read -p "Press Enter to exit..."
