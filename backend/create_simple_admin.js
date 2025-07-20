const pool = require('./db');
const { hashPassword } = require('./auth');

async function createSimpleAdmin() {
  try {
    console.log('🔧 Creando usuario administrador simple...');
    
    // Hash de la contraseña
    const hashedPassword = await hashPassword('admin123');
    
    // Verificar si el usuario ya existe
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Usuario admin ya existe, actualizando contraseña...');
      
      // Actualizar contraseña
      await pool.query(
        'UPDATE users SET password_hash = $1, email = $2, role = $3, is_active = $4 WHERE username = $5',
        [hashedPassword, 'admin@sdo.gob.ar', 'ADMIN', true, 'admin']
      );
      
      console.log('✅ Contraseña actualizada');
    } else {
      console.log('✅ Creando nuevo usuario admin...');
      
      // Crear usuario administrador
      await pool.query(`
        INSERT INTO users (username, password_hash, email, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'admin',
        hashedPassword,
        'admin@sdo.gob.ar',
        'ADMIN',
        true
      ]);
      
      console.log('✅ Usuario administrador creado');
    }
    
    console.log('🎯 Usuario de prueba listo:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Email: admin@sdo.gob.ar');
    console.log('   Rol: ADMIN');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createSimpleAdmin(); 