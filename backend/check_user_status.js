const pool = require('./db');

async function checkUserStatus() {
  try {
    console.log('🔍 Verificando estado de usuarios en la base de datos...\n');
    
    // Verificar todos los usuarios
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        email, 
        role, 
        is_active, 
        dni,
        nombre,
        apellido,
        confirmation_token,
        confirmation_expires,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Total de usuarios: ${result.rows.length}\n`);
    
    result.rows.forEach((user, index) => {
      console.log(`👤 Usuario ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Activo: ${user.is_active ? '✅ Sí' : '❌ No'}`);
      console.log(`   DNI: ${user.dni || 'N/A'}`);
      console.log(`   Nombre: ${user.nombre || 'N/A'}`);
      console.log(`   Token de confirmación: ${user.confirmation_token ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   Expiración: ${user.confirmation_expires || 'N/A'}`);
      console.log(`   Creado: ${user.created_at}`);
      console.log('');
    });
    
    // Verificar usuarios específicos
    const testUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['99999999']
    );
    
    if (testUser.rows.length > 0) {
      const user = testUser.rows[0];
      console.log('🎯 Usuario de prueba (99999999):');
      console.log(`   Activo: ${user.is_active ? '✅ Sí' : '❌ No'}`);
      console.log(`   Token: ${user.confirmation_token ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   Expiración: ${user.confirmation_expires || 'N/A'}`);
    } else {
      console.log('❌ Usuario de prueba no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error);
  } finally {
    await pool.end();
  }
}

checkUserStatus(); 

async function checkUserActivo() {
  try {
    const result = await pool.query(
      'SELECT id, username, dni, is_active, role, email, nombre, apellido FROM users WHERE dni = $1',
      ['35477889']
    );
    if (result.rows.length === 0) {
      console.log('❌ Usuario con DNI 35477889 no encontrado.');
    } else {
      const user = result.rows[0];
      console.log('👤 Usuario encontrado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   DNI: ${user.dni}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Apellido: ${user.apellido}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Activo: ${user.is_active ? '✅ Sí' : '❌ No'}`);
    }
  } catch (error) {
    console.error('❌ Error consultando usuario:', error);
  } finally {
    await pool.end();
  }
}

checkUserActivo(); 