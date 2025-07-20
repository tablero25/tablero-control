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

# Copiar archivos personalizados al build
echo "📁 Copiando archivos personalizados al build..."
cp public/debug.html build/
cp public/force-config.js build/
cp public/fix-api.js build/

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