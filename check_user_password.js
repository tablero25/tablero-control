const { Pool } = require('pg');

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: 'tablero_user',
  host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
  database: 'tablero_user',
  password: 'zdR9rbB8bhIke5DC7O6ANbxVnJ0PvJrM',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    console.log('🔍 Verificando usuario 35477889...');
    
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, is_confirmed, first_login, password_hash FROM users WHERE username = $1',
      ['35477889']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario 35477889 no encontrado');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuario encontrado:');
    console.log('  - ID:', user.id);
    console.log('  - Username:', user.username);
    console.log('  - Email:', user.email);
    console.log('  - Rol:', user.role);
    console.log('  - Activo:', user.is_active);
    console.log('  - Confirmado:', user.is_confirmed);
    console.log('  - Primer login:', user.first_login);
    console.log('  - Hash de contraseña:', user.password_hash ? 'Presente' : 'Faltante');
    
    if (user.password_hash === 'temp_password_hash') {
      console.log('ℹ️ El usuario tiene contraseña temporal');
    } else if (user.password_hash) {
      console.log('ℹ️ El usuario tiene contraseña hasheada');
    } else {
      console.log('❌ El usuario no tiene contraseña');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkUser(); 