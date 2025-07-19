-- Script completo para arreglar la base de datos
-- 1. Arreglar la restricción CHECK del rol
-- 2. Agregar campos para confirmación por email

-- Primero, eliminar la restricción CHECK existente
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Crear la nueva restricción CHECK con todos los roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA'));

-- Agregar campos para confirmación por email
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS dni VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS nombre VARCHAR(100),
ADD COLUMN IF NOT EXISTS apellido VARCHAR(100),
ADD COLUMN IF NOT EXISTS funcion VARCHAR(100),
ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS confirmation_expires TIMESTAMP;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comentarios sobre los nuevos campos
COMMENT ON COLUMN users.dni IS 'DNI del usuario, usado como contraseña inicial';
COMMENT ON COLUMN users.nombre IS 'Nombre del usuario';
COMMENT ON COLUMN users.apellido IS 'Apellido del usuario';
COMMENT ON COLUMN users.funcion IS 'Función o cargo del usuario';
COMMENT ON COLUMN users.first_login IS 'Indica si es el primer login del usuario';
COMMENT ON COLUMN users.confirmation_token IS 'Token único para confirmar el email';
COMMENT ON COLUMN users.confirmation_expires IS 'Fecha de expiración del token de confirmación';

-- Verificar que los cambios se aplicaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position; 