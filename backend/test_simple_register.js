const pool = require('./db');

async function testSimpleRegister() {
  try {
    console.log('🧪 Probando registro simple...\n');
    
    // 1. Registrar un usuario
    console.log('1️⃣ Registrando usuario...');
    
    const dni = '88888888';
    const nombre = 'Test';
    const apellido = 'User';
    const funcion = 'Tester';
    const email = 'test2@sdo.gob.ar';
    const username = '88888888';
    const establecimiento = '25 San Carlos';
    
    // Verificar que el establecimiento existe
    let establecimientoResult = await pool.query(
      'SELECT id FROM establecimientos WHERE nombre = $1 AND activo = true',
      [establecimiento]
    );
    
    let establecimientoId;
    if (establecimientoResult.rows.length === 0) {
      const nuevaEstablecimiento = await pool.query(
        'INSERT INTO establecimientos (nombre, zona, activo) VALUES ($1, $2, $3) RETURNING id',
        [establecimiento, 'SIN ZONA', true]
      );
      establecimientoId = nuevaEstablecimiento.rows[0].id;
    } else {
      establecimientoId = establecimientoResult.rows[0].id;
    }
    
    // Crear usuario directamente en la base de datos
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(dni, 10);
    
    const crypto = require('crypto');
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
    
    const newUser = await pool.query(
      'INSERT INTO users (dni, nombre, apellido, funcion, username, password_hash, role, email, is_active, first_login, confirmation_token, confirmation_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [dni, nombre, apellido, funcion, username, hashedPassword, 'ESTABLECIMIENTO', email, false, true, confirmationToken, expirationDate]
    );
    
    console.log('✅ Usuario creado:', {
      id: newUser.rows[0].id,
      username: newUser.rows[0].username,
      is_active: newUser.rows[0].is_active,
      confirmation_token: newUser.rows[0].confirmation_token ? 'Presente' : 'Ausente'
    });
    
    // 2. Verificar el estado del usuario
    console.log('\n2️⃣ Verificando estado del usuario...');
    const userCheck = await pool.query(
      'SELECT id, username, email, is_active, confirmation_token, confirmation_expires FROM users WHERE username = $1',
      [username]
    );
    
    if (userCheck.rows.length > 0) {
      const user = userCheck.rows[0];
      console.log('📊 Estado del usuario:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Activo: ${user.is_active ? '✅ Sí' : '❌ No'}`);
      console.log(`   Token: ${user.confirmation_token ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   Expiración: ${user.confirmation_expires || 'N/A'}`);
    }
    
    // 3. Intentar hacer login (debería fallar)
    console.log('\n3️⃣ Intentando login (debería fallar)...');
    const loginCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );
    
    if (loginCheck.rows.length === 0) {
      console.log('✅ Login bloqueado correctamente (usuario no activo)');
    } else {
      console.log('❌ Error: Usuario puede hacer login sin confirmar');
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await pool.end();
  }
}

testSimpleRegister(); 