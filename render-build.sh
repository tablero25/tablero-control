#!/bin/bash

echo "🚀 Iniciando build para Render..."

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

# Construir el frontend
echo "🔨 Construyendo frontend..."
npm run build

# Verificar que el build se creó
if [ ! -d "build" ]; then
    echo "❌ Error: El build del frontend no se creó"
    exit 1
fi

# Copiar build al backend
echo "📁 Copiando build al backend..."
cd ..
cp -r frontend/build backend/

echo "✅ Build completado exitosamente!"
echo "📊 Contenido del build:"
ls -la backend/build/

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

echo "🎉 Todo listo para Render!" 