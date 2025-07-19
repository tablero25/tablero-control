-- =============================================
-- Script de estructura para SDO Tablero (PostgreSQL)
-- =============================================

-- 1. Crear base de datos (ejecutar solo si no existe)
-- CREATE DATABASE sdo_tablero;
-- \c sdo_tablero

-- 2. Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de establecimientos
CREATE TABLE IF NOT EXISTS establecimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    zona VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Relación usuario-establecimiento
CREATE TABLE IF NOT EXISTS user_establecimientos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, establecimiento_id)
);

-- 5. Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Datos de prueba
-- Contraseñas deben ser hashes bcrypt reales en producción
INSERT INTO users (username, password_hash, email, role) VALUES
('admin', '$2b$10$hashadmin', 'admin@sdo.gob.ar', 'ADMIN'),
('supervisor1', '$2b$10$hashsupervisor', 'supervisor1@sdo.gob.ar', 'SUPERVISOR'),
('establecimiento1', '$2b$10$hashestablecimiento', 'est1@sdo.gob.ar', 'ESTABLECIMIENTO');

INSERT INTO establecimientos (nombre, zona) VALUES
('47 Materno Infantil', 'ZONA CENTRO'),
('40 San Bernardo', 'ZONA CENTRO'),
('55 Papa Francisco', 'ZONA CENTRO'),
('25 San Carlos', 'ZONA OESTE'),
('10 Nazareno', 'ZONA OESTE'),
('12 Tartagal', 'ZONA NORTE');

-- Asignar establecimientos a usuarios de prueba
INSERT INTO user_establecimientos (user_id, establecimiento_id, is_primary, assigned_by) VALUES
(2, 1, TRUE, 1), -- supervisor1 a 47 Materno Infantil
(3, 2, TRUE, 1);  -- establecimiento1 a 40 San Bernardo

-- =============================================
-- Fin del script
-- ============================================= 