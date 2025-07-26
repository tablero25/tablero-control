const { Pool } = require('pg');

const pool = new Pool({
  user: 'tablero_user',
  host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
  database: 'tablero_user',
  password: 'zdR9rbB8bhIke5DC7O6ANbxVnJ0PvJrM',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

const query = `
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
`;

async function fixTable() {
  try {
    console.log('🔧 Conectando a la base de datos de Render...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa');
    
    console.log('🔧 Agregando columnas a la tabla users...');
    await pool.query(query);
    console.log('✅ Columnas agregadas correctamente a la tabla users');
    
    // Verificar que las columnas se agregaron
    console.log('🔍 Verificando estructura de la tabla...');
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY column_name
    `);
    
    console.log('📋 Columnas actuales en la tabla users:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

fixTable(); 