@echo off
echo ========================================
echo    SUBIENDO CAMBIOS A GITHUB
echo ========================================

echo.
echo 1. Agregando archivos...
git add backend/authRoutes.js
git add frontend/src/Configuracion.css
git add frontend/src/Login.js

echo.
echo 2. Haciendo commit...
git commit -m "Completar funcionalidad reset usuarios"

echo.
echo 3. Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo    PROCESO COMPLETADO
echo ========================================
echo.
echo Render se desplegará automáticamente en 2-3 minutos
echo.
pause 