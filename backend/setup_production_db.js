const pool = require('./db');
const { hashPassword } = require('./auth');

async function setupProductionDatabase() {
  try {
    console.log('🔧 Configurando base de datos de producción...');
    
    // Verificar conexión
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a base de datos establecida:', result.rows[0]);
    
    // Crear tablas si no existen
    console.log('📋 Creando tablas...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'USER',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS establecimientos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        tipo VARCHAR(50),
        region VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_establecimientos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, establecimiento_id)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tablas creadas correctamente');
    
    // Insertar establecimientos de ejemplo
    console.log('🏥 Insertando establecimientos...');
    
    const establecimientos = [
      { nombre: '10 Nazareno', codigo: '10', tipo: 'Hospital', region: 'Salta' },
      { nombre: '12 Tartagal', codigo: '12', tipo: 'Hospital', region: 'Salta' },
      { nombre: '25 San Carlos', codigo: '25', tipo: 'Hospital', region: 'Salta' },
      { nombre: '28 Gral. Enrique Mosconi', codigo: '28', tipo: 'Hospital', region: 'Salta' },
      { nombre: '53 Angastaco', codigo: '53', tipo: 'Hospital', region: 'Salta' }
    ];
    
    for (const est of establecimientos) {
      await pool.query(`
        INSERT INTO establecimientos (nombre, codigo, tipo, region)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (codigo) DO NOTHING
      `, [est.nombre, est.codigo, est.tipo, est.region]);
    }
    
    console.log('✅ Establecimientos insertados');
    
    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    
    const hashedPassword = await hashPassword('admin123');
    
    await pool.query(`
      INSERT INTO users (username, password_hash, email, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active
    `, ['admin', hashedPassword, 'admin@sdo.gob.ar', 'ADMIN', true]);
    
    console.log('✅ Usuario administrador creado/actualizado');
    
    // Asignar todos los establecimientos al admin
    console.log('🔗 Asignando establecimientos al admin...');
    
    const adminUser = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    const establecimientosList = await pool.query('SELECT id FROM establecimientos');
    
    for (const est of establecimientosList.rows) {
      await pool.query(`
        INSERT INTO user_establecimientos (user_id, establecimiento_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, establecimiento_id) DO NOTHING
      `, [adminUser.rows[0].id, est.id]);
    }
    
    console.log('✅ Establecimientos asignados al admin');
    
    console.log('🎉 ¡Base de datos de producción configurada exitosamente!');
    console.log('📋 Credenciales del sistema:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Email: admin@sdo.gob.ar');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
  } finally {
    await pool.end();
  }
}

setupProductionDatabase(); 