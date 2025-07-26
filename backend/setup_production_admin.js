const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos de producción
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupProductionAdmin() {
  try {
    console.log('🔧 Configurando usuario admin en producción...');
    
    // Verificar si el usuario admin ya existe
    const existingUser = await pool.query(
      'SELECT id, first_login FROM users WHERE username = $1',
      ['admin']
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Usuario admin ya existe, actualizando first_login...');
      
      await pool.query(
        'UPDATE users SET first_login = TRUE WHERE username = $1',
        ['admin']
      );
      
      console.log('✅ First login actualizado a TRUE');
      return;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario admin
    const result = await pool.query(
      `INSERT INTO users (
        username, 
        email, 
        password, 
        role, 
        dni, 
        nombre, 
        apellido, 
        funcion, 
        is_active, 
        first_login,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
      [
        'admin',
        'admin@tablero.com',
        hashedPassword,
        'ADMIN',
        '00000000',
        'Administrador',
        'Sistema',
        'Administrador del Sistema',
        true,
        true  // first_login = TRUE
      ]
    );

    console.log('✅ Usuario admin creado exitosamente en producción:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   First Login: TRUE`);
    console.log('');
    console.log('🎯 Ahora puedes:');
    console.log('   1. Ir a: https://tablero-control-1.onrender.com');
    console.log('   2. Login con: admin / admin123');
    console.log('   3. Te llevará automáticamente a cambiar contraseña');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar
setupProductionAdmin(); 