@echo off
echo Configurando PostgreSQL para SDO Tablero...
echo.

REM Configurar PATH
set PATH=%PATH%;C:\Program Files\PostgreSQL\17\bin

REM Crear usuario luxiot
echo Creando usuario luxiot...
psql -U postgres -c "CREATE USER luxiot WITH PASSWORD 'Sistema2025';" postgres
if %errorlevel% neq 0 (
    echo Error al crear usuario. Intentando continuar...
)

REM Dar permisos de superusuario temporalmente
echo Dando permisos...
psql -U postgres -c "ALTER USER luxiot WITH SUPERUSER;" postgres

REM Crear base de datos
echo Creando base de datos sdo_tablero...
createdb -U luxiot sdo_tablero

REM Ejecutar script SQL
echo Ejecutando script SQL...
psql -U luxiot -d sdo_tablero -f "%~dp0sdo_schema.sql"

echo.
echo Configuracion completada!
echo Usuario: luxiot
echo Contraseña: Sistema2025
echo Base de datos: sdo_tablero
pause 