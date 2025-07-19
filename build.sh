#!/bin/bash

echo "🚀 Iniciando build robusto para Sistema de Tableros de Control..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json en el directorio actual"
    exit 1
fi

echo "📦 Instalando dependencias del proyecto raíz..."
npm install

echo "🔧 Instalando dependencias del backend..."
cd backend
npm install
cd ..

echo "🎨 Instalando dependencias del frontend..."
cd frontend
npm install

echo "🏗️ Construyendo frontend para producción..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "build" ]; then
    echo "❌ Error: El build del frontend falló"
    exit 1
fi

echo "📁 Copiando build del frontend al backend..."
cp -r build ../backend/

cd ..

echo "✅ Build completado exitosamente!"
echo "📊 Estructura final:"
echo "   - Backend: $(pwd)/backend"
echo "   - Frontend build: $(pwd)/backend/build"
echo "   - Archivos estáticos listos para servir"

echo "🎉 Sistema listo para despliegue en Render!" 