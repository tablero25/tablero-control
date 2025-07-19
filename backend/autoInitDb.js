const { Pool } = require('pg');

// Configuración para la base de datos de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function checkAndInitializeDatabase() {
  try {
    console.log('🔍 Verificando estado de la base de datos...');
    
    // Verificar si las tablas existen
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'establecimientos', 'user_establecimientos', 'sessions')
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Tablas existentes:', existingTables);
    
    // Si faltan tablas, inicializar la base de datos
    if (existingTables.length < 4) {
      console.log('🚀 Inicializando base de datos...');
      await initializeDatabase();
    } else {
      console.log('✅ Base de datos ya está inicializada');
      
      // Verificar si existe el usuario admin
      const adminResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE username = $1', ['admin']);
      if (adminResult.rows[0].count === '0') {
        console.log('👤 Creando usuario administrador...');
        await createAdminUser();
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    // No lanzar error para que la aplicación continúe funcionando
  }
}

async function initializeDatabase() {
  try {
    // 1. Crear tabla users
    await pool.query(`
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
      )
    `);
    console.log('✅ Tabla users creada');
    
    // 2. Crear tabla establecimientos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS establecimientos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        zona VARCHAR(50) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla establecimientos creada');
    
    // 3. Crear tabla user_establecimientos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_establecimientos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT FALSE,
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, establecimiento_id)
      )
    `);
    console.log('✅ Tabla user_establecimientos creada');
    
    // 4. Crear tabla sessions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla sessions creada');
    
    // 5. Crear índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users(confirmation_token);
      CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    `);
    console.log('✅ Índices creados');
    
    // 6. Crear usuario administrador
    await createAdminUser();
    
    // 7. Crear establecimientos iniciales
    await pool.query(`
      INSERT INTO establecimientos (nombre, zona, activo) VALUES
      ('47 Materno Infantil', 'ZONA CENTRO', true),
      ('40 San Bernardo', 'ZONA CENTRO', true),
      ('55 Papa Francisco', 'ZONA CENTRO', true),
      ('25 San Carlos', 'ZONA OESTE', true),
      ('10 Nazareno', 'ZONA OESTE', true),
      ('12 Tartagal', 'ZONA NORTE', true),
      ('28 Gral. Enrique Mosconi', 'ZONA NORTE', true),
      ('53 Angastaco', 'ZONA SUR', true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Establecimientos creados');
    
    console.log('🎉 Base de datos inicializada exitosamente');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

async function createAdminUser() {
  try {
    await pool.query(`
      INSERT INTO users (username, password_hash, email, role, is_active, dni, nombre, apellido, funcion, first_login) 
      VALUES ('admin', '$2b$10$SO5a4zre/RCyd8V65mYvauIPDcmpEIgnDW.2T5gWjjlf4rfMiHTEC', 'admin@sdo.gob.ar', 'ADMIN', true, '12345678', 'Administrador', 'Sistema', 'Administrador General', false)
      ON CONFLICT (username) DO NOTHING
    `);
    console.log('✅ Usuario administrador creado');
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  }
}

module.exports = { checkAndInitializeDatabase }; 