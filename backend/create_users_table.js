const { Pool } = require('pg');

const pool = new Pool({
  user: 'tablero_user',
  host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
  database: 'tablero_user',
  password: 'zdR9rbB8bhIke5DC7O6ANbxVnJ0PvJrM',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  dni VARCHAR(20) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  funcion VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'USER',
  is_active BOOLEAN DEFAULT FALSE,
  confirmation_token TEXT,
  confirmation_expires TIMESTAMP,
  confirmed_at TIMESTAMP,
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

async function createTable() {
  try {
    console.log('🔧 Conectando a la base de datos de Render...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa');
    
    console.log('🔧 Verificando/creando tabla users...');
    await pool.query(createTableQuery);
    console.log('✅ Tabla users verificada/creada correctamente');
    
    // Verificar que la tabla existe y tiene las columnas correctas
    console.log('🔍 Verificando estructura de la tabla...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY column_name
    `);
    
    console.log('📋 Columnas en la tabla users:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Verificar si hay usuarios existentes
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Usuarios existentes: ${userCount.rows[0].count}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

createTable(); 