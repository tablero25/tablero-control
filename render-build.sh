#!/bin/bash

echo "🚀 Iniciando build para Render..."

# Construir el frontend
echo "📦 Construyendo frontend..."
cd frontend
npm run build
cd ..

# Crear directorio de build del backend si no existe
mkdir -p backend/build

# Copiar el build del frontend al backend
echo "📁 Copiando build del frontend..."
cp -r frontend/build/* backend/build/

# Copiar archivos del backend
echo "📁 Copiando archivos del backend..."
cp backend/package.json backend/build/
cp backend/index.js backend/build/
cp backend/authRoutes.js backend/build/

# Copiar archivo de configuración global
echo "📁 Copiando configuración global..."
cp frontend/public/global-config.js backend/build/

# Crear directorio data si no existe
mkdir -p backend/build/data

echo "✅ Build completado exitosamente!"
echo "📂 Archivos en backend/build/:"
ls -la backend/build/ 