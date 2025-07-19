@echo off
echo 🚀 Desplegando frontend YA MISMO...

echo 📦 Construyendo frontend...
cd frontend
call npm run build
cd ..

echo 📁 Copiando build al backend...
if exist "backend\build" rmdir /s /q "backend\build"
xcopy "frontend\build" "backend\build" /e /i /y

echo 🔄 Haciendo commit y push...
git add backend/build
git commit -m "Frontend build agregado - YA MISMO"
git push origin main

echo 🎉 ¡Frontend desplegado exitosamente!
echo ⏱️ Espera 2-3 minutos para que Render actualice
echo 🌐 URL: https://tablero-control-1.onrender.com
pause 