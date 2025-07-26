const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración para la base de datos de Render
const pool = new Pool({
  connectionString: 'postgresql://tablero_user:zdR9rbB8bhIke5DC706ANbxVnJ0PvJrM@dpg-d1tfjure5dus73dhg1p0-a.oregon.render.com/tablero_user',
  ssl: {
    rejectUnauthorized: false
  }
});

async function crearUsuarioDirecto() {
  try {
    console.log('🔧 CREANDO USUARIO DIRECTO EN LA BASE DE DATOS\\n');
    
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
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  El usuario ya existe:');
      console.log(existingUser.rows[0]);
      return;
    }
    
    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password.toLowerCase(), saltRounds);
    
    // Insertar el usuario
    const result = await pool.query(
      `INSERT INTO users (dni, nombre, apellido, funcion, email, username, password_hash, role, is_active, first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [dni, nombre, apellido, funcion, email, username, passwordHash, 'ESTABLECIMIENTO', true, true]
    );
    
    console.log('✅ Usuario creado exitosamente:');
    console.log(result.rows[0]);
    console.log('');
    console.log('🔑 Credenciales de acceso:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('');
    console.log('🌐 Puedes usar estas credenciales para hacer login en la aplicación.');
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
  } finally {
    await pool.end();
  }
}

crearUsuarioDirecto(); 