const pool = require('./db');

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuario administrador...');
    
    // Buscar usuario admin
    const adminUser = await pool.query(`
      SELECT id, username, email, role, is_active, created_at
      FROM users 
      WHERE username = 'admin'
    `);
    
    if (adminUser.rows.length > 0) {
      console.log('✅ Usuario admin encontrado:');
      console.log('   ID:', adminUser.rows[0].id);
      console.log('   Username:', adminUser.rows[0].username);
      console.log('   Email:', adminUser.rows[0].email);
      console.log('   Role:', adminUser.rows[0].role);
      console.log('   Activo:', adminUser.rows[0].is_active);
      console.log('   Creado:', adminUser.rows[0].created_at);
      
      // Verificar establecimientos asignados
      const establecimientos = await pool.query(`
        SELECT e.nombre, ue.is_primary
        FROM user_establecimientos ue
        JOIN establecimientos e ON ue.establecimiento_id = e.id
        WHERE ue.user_id = $1
      `, [adminUser.rows[0].id]);
      
      console.log('\n🏥 Establecimientos asignados al admin:');
      establecimientos.rows.forEach(est => {
        console.log(`   - ${est.nombre} ${est.is_primary ? '(PRINCIPAL)' : ''}`);
      });
      
    } else {
      console.log('❌ Usuario admin no encontrado');
      
      // Mostrar todos los usuarios
      const allUsers = await pool.query('SELECT username, email, role FROM users LIMIT 10');
      console.log('\n👥 Usuarios existentes:');
      allUsers.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
      });
    }
    
    console.log('\n🎯 Credenciales para probar:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   URL: https://tablero-control-1.onrender.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminUser(); 