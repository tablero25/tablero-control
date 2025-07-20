const pool = require('./db');
const { hashPassword } = require('./auth');

async function createSimpleUser() {
  try {
    console.log('🔧 Creando usuario simple...');
    
    // Hash de la contraseña
    const hashedPassword = await hashPassword('admin123');
    
    // Crear usuario simple con solo los campos básicos
    const result = await pool.query(`
      INSERT INTO users (username, password_hash, email, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email,
        role = EXCLUDED.role
      RETURNING id, username, email, role
    `, [
      'admin',
      hashedPassword,
      'admin@test.com',
      'ADMIN'
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

createSimpleUser(); 