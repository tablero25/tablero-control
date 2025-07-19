-- =============================================
-- Script de inicialización para Render.com
-- Sistema de Tableros de Control - SDO
-- =============================================

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    dni VARCHAR(20) UNIQUE,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    funcion VARCHAR(100),
    first_login BOOLEAN DEFAULT TRUE,
    confirmation_token VARCHAR(255),
    confirmation_expires TIMESTAMP
);

-- 2. Tabla de establecimientos
CREATE TABLE IF NOT EXISTS establecimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    zona VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Relación usuario-establecimiento
CREATE TABLE IF NOT EXISTS user_establecimientos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, establecimiento_id)
);

-- 4. Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_establecimientos_nombre ON establecimientos(nombre);
CREATE INDEX IF NOT EXISTS idx_establecimientos_zona ON establecimientos(zona);
CREATE INDEX IF NOT EXISTS idx_establecimientos_activo ON establecimientos(activo);

CREATE INDEX IF NOT EXISTS idx_user_establecimientos_user_id ON user_establecimientos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_establecimientos_establecimiento_id ON user_establecimientos(establecimiento_id);

-- 6. Insertar datos iniciales

-- Usuario administrador por defecto
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO users (username, password_hash, email, role, is_active, dni, nombre, apellido, funcion, first_login) VALUES
('admin', '$2b$10$SO5a4zre/RCyd8V65mYvauIPDcmpEIgnDW.2T5gWjjlf4rfMiHTEC', 'admin@sdo.gob.ar', 'ADMIN', true, '12345678', 'Administrador', 'Sistema', 'Administrador General', false)
ON CONFLICT (username) DO NOTHING;

-- Establecimientos iniciales
INSERT INTO establecimientos (nombre, zona, activo) VALUES
('47 Materno Infantil', 'ZONA CENTRO', true),
('40 San Bernardo', 'ZONA CENTRO', true),
('55 Papa Francisco', 'ZONA CENTRO', true),
('25 San Carlos', 'ZONA OESTE', true),
('10 Nazareno', 'ZONA OESTE', true),
('12 Tartagal', 'ZONA NORTE', true),
('28 Gral. Enrique Mosconi', 'ZONA NORTE', true),
('53 Angastaco', 'ZONA SUR', true)
ON CONFLICT DO NOTHING;

-- 7. Comentarios sobre las tablas
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON COLUMN users.dni IS 'DNI del usuario, usado como contraseña inicial';
COMMENT ON COLUMN users.nombre IS 'Nombre del usuario';
COMMENT ON COLUMN users.apellido IS 'Apellido del usuario';
COMMENT ON COLUMN users.funcion IS 'Función o cargo del usuario';
COMMENT ON COLUMN users.first_login IS 'Indica si es el primer login del usuario';
COMMENT ON COLUMN users.confirmation_token IS 'Token único para confirmar el email';
COMMENT ON COLUMN users.confirmation_expires IS 'Fecha de expiración del token de confirmación';

COMMENT ON TABLE establecimientos IS 'Tabla de establecimientos de salud';
COMMENT ON TABLE user_establecimientos IS 'Relación muchos a muchos entre usuarios y establecimientos';
COMMENT ON TABLE sessions IS 'Tabla de sesiones activas de usuarios';

-- 8. Verificar que todo se creó correctamente
SELECT 'Tablas creadas exitosamente' as status;

-- Verificar estructura de la tabla users
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar usuarios creados
SELECT id, username, email, role, is_active FROM users;

-- Verificar establecimientos creados
SELECT id, nombre, zona, activo FROM establecimientos;

-- =============================================
-- Fin del script de inicialización
-- ============================================= 