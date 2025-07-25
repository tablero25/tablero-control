const pool = require('./db');
const { hashPassword } = require('./auth');

async function createTestUser() {
  try {
    console.log('🔧 Creando usuario de prueba...');
    
    // Hash de la contraseña
    const hashedPassword = await hashPassword('admin123');
    
    // Crear usuario de prueba
    const result = await pool.query(`
      INSERT INTO users (username, password_hash, email, role, dni, nombre, apellido, funcion, is_active, first_login)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        dni = EXCLUDED.dni,
        nombre = EXCLUDED.nombre,
        apellido = EXCLUDED.apellido,
        funcion = EXCLUDED.funcion,
        is_active = EXCLUDED.is_active,
        first_login = EXCLUDED.first_login
      RETURNING id, username, email, role
    `, [
      'admin',
      hashedPassword,
      'admin@test.com',
      'ADMIN',
      '12345678',
      'Administrador',
      'Sistema',
      'Administrador',
      true,
      false
    ]);
    
    console.log('✅ Usuario creado exitosamente:', result.rows[0]);
    console.log('🔑 Credenciales:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
  } finally {
    await pool.end();
  }
}

createTestUser(); 