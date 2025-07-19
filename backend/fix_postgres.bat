@echo off
echo Configurando PostgreSQL para acceso sin contraseña...
echo.

REM Detener servicio PostgreSQL
echo Deteniendo servicio PostgreSQL...
net stop postgresql-x64-17

REM Esperar un momento
timeout /t 3 /nobreak > nul

REM Modificar pg_hba.conf para permitir acceso local sin contraseña
echo Configurando autenticacion...
copy "C:\Program Files\PostgreSQL\17\data\pg_hba.conf" "C:\Program Files\PostgreSQL\17\data\pg_hba.conf.backup"

REM Crear nuevo pg_hba.conf
echo # PostgreSQL Client Authentication Configuration File > "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
echo # TYPE  DATABASE        USER            ADDRESS                 METHOD >> "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
echo local   all             all                                     trust >> "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
echo host    all             all             127.0.0.1/32            trust >> "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
echo host    all             all             ::1/128                 trust >> "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"

REM Reiniciar servicio
echo Reiniciando servicio PostgreSQL...
net start postgresql-x64-17

REM Esperar a que el servicio esté listo
timeout /t 5 /nobreak > nul

REM Configurar PATH
set PATH=%PATH%;C:\Program Files\PostgreSQL\17\bin

REM Crear usuario y base de datos
echo Creando usuario y base de datos...
psql -U postgres -c "CREATE USER luxiot WITH PASSWORD 'Sistema2025';" postgres
psql -U postgres -c "ALTER USER luxiot WITH SUPERUSER;" postgres
createdb -U postgres sdo_tablero
psql -U postgres -d sdo_tablero -f "%~dp0sdo_schema.sql"

echo.
echo Configuracion completada!
echo Ahora puedes conectar con:
echo - Usuario: postgres (sin contraseña)
echo - Usuario: luxiot (contraseña: Sistema2025)
echo - Base de datos: sdo_tablero
pause 