const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos (usar la misma que tu backend)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tablero_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function resetUsers() {
  try {
    console.log('🔄 Iniciando reset de usuarios...');
    
    // Eliminar todos los usuarios
    const deleteResult = await pool.query('DELETE FROM users');
    console.log(`✅ ${deleteResult.rowCount} usuarios eliminados`);
    
    // Crear usuario nuevo
    const username = '123';
    const password = '123';
    const email = '123@correo.com';
    const role = 'admin';
    const dni = '123';
    const nombre = 'Usuario';
    const apellido = 'Demo';
    const funcion = 'admin';
    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, email, role, dni, nombre, apellido, funcion, is_active, is_confirmed, is_blocked, first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, TRUE, FALSE, FALSE) RETURNING id, username, email, role`,
      [username, hashedPassword, email, role, dni, nombre, apellido, funcion]
    );

    console.log('✅ Usuario creado exitosamente:');
    console.log('   Username: 123');
    console.log('   Password: 123');
    console.log('   Role: admin');
    console.log('   Email: 123@correo.com');
    
    await pool.end();
    console.log('🎉 Reset completado. Puedes hacer login con usuario: 123, password: 123');
    
  } catch (error) {
    console.error('❌ Error reseteando usuarios:', error);
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar el reset
resetUsers(); 