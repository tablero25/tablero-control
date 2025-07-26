const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function resetUserPassword() {
  console.log('🔑 RESETEANDO CONTRASEÑA DEL USUARIO 35477889\n');
  
  const pool = new Pool({
    user: 'tablero_user',
    host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
    database: 'tablero_user',
    password: 'zdR9rbB8bhIke5DC7O6ANbxVnJ0PvJrM',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Conectando a la base de datos...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa\n');

    const username = '35477889';
    const newPassword = '123456'; // Nueva contraseña simple

    // Verificar que el usuario existe
    const userCheck = await pool.query(
      'SELECT id, username, email, role FROM users WHERE username = $1',
      [username]
    );

    if (userCheck.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = userCheck.rows[0];
    console.log(`👤 Usuario encontrado: ${user.username} (${user.email}) - ${user.role}`);

    // Generar hash de la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar la contraseña
    const updateResult = await pool.query(
      'UPDATE users SET password_hash = $1, first_login = false WHERE username = $2 RETURNING *',
      [hashedPassword, username]
    );

    if (updateResult.rows.length > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log(`🔑 Nueva contraseña: ${newPassword}`);
      console.log(`👤 Usuario: ${username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎭 Rol: ${user.role}`);
      
      console.log('\n🎯 CREDENCIALES DE ACCESO:');
      console.log(`Usuario: ${username}`);
      console.log(`Contraseña: ${newPassword}`);
      
    } else {
      console.log('❌ Error al actualizar la contraseña');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetUserPassword(); 