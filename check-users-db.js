const { Pool } = require('pg');

async function checkUsersDB() {
  console.log('🔍 VERIFICANDO USUARIOS EN LA BASE DE DATOS\n');
  
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

    // Obtener todos los usuarios
    const result = await pool.query(`
      SELECT id, username, email, dni, nombre, apellido, funcion, role, 
             is_active, is_confirmed, created_at, confirmed_at,
             CASE 
               WHEN password_hash = 'temp_password_hash' THEN 'TEMP'
               ELSE 'HASHED'
             END as password_type
      FROM users 
      ORDER BY created_at DESC
    `);

    console.log(`📊 Total de usuarios: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    console.log('👥 LISTA DE USUARIOS:');
    console.log('─'.repeat(100));
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Usuario: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.nombre} ${user.apellido}`);
      console.log(`   Rol: ${user.role || 'USER'}`);
      console.log(`   Estado: ${user.is_active ? '✅ Activo' : '❌ Bloqueado'}`);
      console.log(`   Confirmado: ${user.is_confirmed ? '✅ Sí' : '⏳ Pendiente'}`);
      console.log(`   Contraseña: ${user.password_type}`);
      console.log(`   Creado: ${user.created_at}`);
      if (user.confirmed_at) {
        console.log(`   Confirmado: ${user.confirmed_at}`);
      }
      console.log('─'.repeat(100));
    });

    // Mostrar resumen
    const activeUsers = result.rows.filter(u => u.is_active);
    const confirmedUsers = result.rows.filter(u => u.is_confirmed);
    const tempPasswordUsers = result.rows.filter(u => u.password_type === 'TEMP');

    console.log('\n📋 RESUMEN:');
    console.log(`- Total usuarios: ${result.rows.length}`);
    console.log(`- Usuarios activos: ${activeUsers.length}`);
    console.log(`- Usuarios confirmados: ${confirmedUsers.length}`);
    console.log(`- Usuarios con contraseña temporal: ${tempPasswordUsers.length}`);

    // Mostrar usuarios con contraseña temporal
    if (tempPasswordUsers.length > 0) {
      console.log('\n🔑 USUARIOS CON CONTRASEÑA TEMPORAL:');
      tempPasswordUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
      });
    }

    // Mostrar usuarios pendientes
    const pendingUsers = result.rows.filter(u => !u.is_confirmed);
    if (pendingUsers.length > 0) {
      console.log('\n⏳ USUARIOS PENDIENTES DE CONFIRMACIÓN:');
      pendingUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersDB(); 