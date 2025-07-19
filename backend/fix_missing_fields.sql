-- Script para agregar solo los campos que faltan en la tabla users

-- Verificar qué campos existen
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY column_name;

-- Agregar campos que faltan uno por uno
ALTER TABLE users ADD COLUMN IF NOT EXISTS dni VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS apellido VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS funcion VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_expires TIMESTAMP;

-- Agregar restricción UNIQUE al DNI si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_dni_key' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_dni_key UNIQUE (dni);
    END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position; 