-- COMANDOS SQL PARA EJECUTAR EN PSQL
-- Copia y pega estos comandos uno por uno en tu terminal PSQL

-- 1. Verificar estructura actual
\d users;

-- 2. Agregar columna password_hash
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);

-- 3. Agregar columna role
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'ESTABLECIMIENTO';

-- 4. Agregar columna is_active
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- 5. Agregar columna first_login
ALTER TABLE users ADD COLUMN first_login BOOLEAN DEFAULT TRUE;

-- 6. Verificar que todo esté bien
\d users;

-- 7. Para salir
\q 