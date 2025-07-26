#!/bin/bash

echo "🚀 Iniciando build para Render..."

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install --production
cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
npm run build
cd ..

# Copiar build del frontend al backend
echo "📁 Copiando build del frontend..."
cp -r frontend/build backend/

echo "✅ Build completado exitosamente!" 