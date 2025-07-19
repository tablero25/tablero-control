-- Script para agregar campos de confirmación por email a la tabla users

-- Agregar campos para confirmación por email
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS dni VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS nombre VARCHAR(100),
ADD COLUMN IF NOT EXISTS apellido VARCHAR(100),
ADD COLUMN IF NOT EXISTS funcion VARCHAR(100),
ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS confirmation_expires TIMESTAMP;

-- Crear índice para el token de confirmación
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users(confirmation_token);

-- Crear índice para el DNI
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);

-- Comentarios sobre los nuevos campos
COMMENT ON COLUMN users.dni IS 'DNI del usuario, usado como contraseña inicial';
COMMENT ON COLUMN users.nombre IS 'Nombre del usuario';
COMMENT ON COLUMN users.apellido IS 'Apellido del usuario';
COMMENT ON COLUMN users.funcion IS 'Función o cargo del usuario';
COMMENT ON COLUMN users.first_login IS 'Indica si es el primer login del usuario';
COMMENT ON COLUMN users.confirmation_token IS 'Token único para confirmar el email';
COMMENT ON COLUMN users.confirmation_expires IS 'Fecha de expiración del token de confirmación'; 