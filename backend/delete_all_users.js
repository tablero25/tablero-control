const { Pool } = require('pg');

const pool = new Pool({
  user: 'tablero_user',
  host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
  database: 'tablero_user',
  password: 'zdR9rbB8bhIke5DC7O6ANbxVnJ0PvJrM',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function deleteAllUsers() {
  try {
    console.log('🔧 Conectando a la base de datos de Render...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa');
    
    const result = await pool.query('DELETE FROM users');
    console.log(`🗑️ Usuarios eliminados: ${result.rowCount}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

deleteAllUsers(); 