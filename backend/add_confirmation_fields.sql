-- Script para agregar campos de confirmación y bloqueo a la tabla users
-- Ejecutar este script para actualizar la estructura de la base de datos

-- Agregar campo is_confirmed (por defecto TRUE para usuarios existentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT TRUE;

-- Agregar campo is_blocked (por defecto FALSE para usuarios existentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Agregar campos adicionales para información del usuario
ALTER TABLE users ADD COLUMN IF NOT EXISTS dni VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS apellido VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS funcion VARCHAR(100);

-- Actualizar usuarios existentes para que estén confirmados
UPDATE users SET is_confirmed = TRUE WHERE is_confirmed IS NULL;

-- Actualizar usuarios existentes para que no estén bloqueados
UPDATE users SET is_blocked = FALSE WHERE is_blocked IS NULL;

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 