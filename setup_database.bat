@echo off
echo ========================================
echo CONFIGURANDO BASE DE DATOS POSTGRESQL
echo ========================================

echo.
echo 1. Verificando PostgreSQL...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" --version
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL no encontrado
    pause
    exit /b 1
)

echo.
echo 2. Creando base de datos sdo_tablero...
"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres sdo_tablero
if %errorlevel% neq 0 (
    echo La base de datos ya existe o hay un error
)

echo.
echo 3. Creando usuario luxiot...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE USER luxiot WITH PASSWORD 'Sistema2025';"
if %errorlevel% neq 0 (
    echo El usuario ya existe o hay un error
)

echo.
echo 4. Asignando permisos al usuario...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sdo_tablero TO luxiot;"
if %errorlevel% neq 0 (
    echo Error asignando permisos
)

echo.
echo 5. Ejecutando script de esquema...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U luxiot -d sdo_tablero -f backend\sdo_schema.sql
if %errorlevel% neq 0 (
    echo Error ejecutando esquema
)

echo.
echo 6. Creando usuario administrador...
cd backend
node create_admin_user.js
if %errorlevel% neq 0 (
    echo Error creando usuario administrador
)

echo.
echo ========================================
echo CONFIGURACIÓN COMPLETADA
echo ========================================
echo.
echo Credenciales de la base de datos:
echo - Host: localhost
echo - Puerto: 5432
echo - Base de datos: sdo_tablero
echo - Usuario: luxiot
echo - Contraseña: Sistema2025
echo.
echo Credenciales del sistema:
echo - Usuario: admin
echo - Contraseña: admin123
echo.
pause 