#!/bin/bash

# Script para iniciar tanto el backend como el frontend

echo "🚀 Iniciando servidor de desarrollo..."
echo ""

# Verificar si MongoDB está corriendo
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB no está corriendo. Por favor inicia MongoDB primero:"
    echo "   brew services start mongodb-community"
    echo "   o"
    echo "   mongod"
    echo ""
fi

# Iniciar backend en segundo plano
echo "📡 Iniciando backend en http://localhost:3000..."
cd server
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar un momento para que el backend inicie
sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend en http://localhost:4200..."
npm start

# Cuando se cierre el frontend, cerrar también el backend
trap "kill $BACKEND_PID" EXIT

