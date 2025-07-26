const pool = require('./backend/db');
const { hashPassword } = require('./backend/auth');

async function crearUsuarioLocal() {
  try {
    console.log('🔧 CREANDO USUARIO LOCAL\n');
    
    // Datos del usuario
    const dni = '12345678';
    const nombre = 'Usuario';
    const apellido = 'Demo';
    const funcion = 'Médico';
    const email = 'usuario@demo.com';
    const username = dni;
    const password = dni; // La contraseña es el DNI
    
    console.log('📋 Datos del usuario:');
    console.log(`DNI: ${dni}`);
    console.log(`Nombre: ${nombre} ${apellido}`);
    console.log(`Función: ${funcion}`);
    console.log(`Email: ${email}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('');
    
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE dni = $1 OR username = $2 OR email = $3',
      [dni, username, email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️ El usuario ya existe en la base de datos');
      console.log('💡 Puedes usar estos datos para hacer login:');
      console.log(`   Usuario: ${username}`);
      console.log(`   Contraseña: ${password}`);
      return;
    }
    
    // Hashear la contraseña usando la función existente
    const hashedPassword = await hashPassword(password);
    
    // Crear el usuario directamente en la base de datos
    const newUser = await pool.query(
      `INSERT INTO users (dni, nombre, apellido, funcion, username, password_hash, role, email, is_active, first_login) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, username, dni, nombre, apellido, funcion, role, email`,
      [dni, nombre, apellido, funcion, username, hashedPassword, 'ESTABLECIMIENTO', email, true, false]
    );
    
    console.log('✅ Usuario creado exitosamente!');
    console.log('📊 Datos del usuario creado:');
    console.log(`   ID: ${newUser.rows[0].id}`);
    console.log(`   Username: ${newUser.rows[0].username}`);
    console.log(`   Email: ${newUser.rows[0].email}`);
    console.log(`   Nombre: ${newUser.rows[0].nombre} ${newUser.rows[0].apellido}`);
    console.log(`   Función: ${newUser.rows[0].funcion}`);
    console.log(`   Rol: ${newUser.rows[0].role}`);
    console.log('');
    console.log('🔑 DATOS DE ACCESO:');
    console.log(`   Usuario: ${username}`);
    console.log(`   Contraseña: ${password}`);
    console.log('');
    console.log('🌐 Ahora puedes hacer login en:');
    console.log('   https://tablero-control-1.onrender.com/login');
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la función
crearUsuarioLocal(); 