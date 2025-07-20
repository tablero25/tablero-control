const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT username, email, role FROM users LIMIT 10');
    console.log('Usuarios disponibles:');
    result.rows.forEach(row => {
      console.log(`- Usuario: ${row.username}, Email: ${row.email}, Rol: ${row.role}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

checkUsers(); 