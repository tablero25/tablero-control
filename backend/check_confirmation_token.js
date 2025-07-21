const pool = require('./db');

async function checkConfirmationToken() {
  try {
    console.log('🔍 Verificando token de confirmación...\n');
    
    // Buscar el usuario más reciente
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        email, 
        is_active, 
        confirmation_token,
        confirmation_expires,
        created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('👤 Usuario más reciente:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Activo: ${user.is_active ? '✅ Sí' : '❌ No'}`);
      console.log(`   Token: ${user.confirmation_token ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   Expiración: ${user.confirmation_expires || 'N/A'}`);
      console.log(`   Creado: ${user.created_at}`);
      
      if (user.confirmation_token) {
        console.log('\n🔗 Enlace de confirmación:');
        console.log(`https://tablero-control-1.onrender.com/confirmar-usuario?token=${user.confirmation_token}`);
        
        console.log('\n📧 Para ver el email completo:');
        console.log('1. Revisa la consola del backend (donde corre node index.js)');
        console.log('2. Busca líneas que contengan "Email de confirmación enviado:"');
        console.log('3. O busca líneas que contengan "https://ethereal.email/"');
        
        console.log('\n🎯 Para confirmar el usuario:');
        console.log('1. Ve a: http://localhost:3000/confirmar-usuario?token=' + user.confirmation_token);
        console.log('2. O haz clic en el enlace del email');
        
      } else {
        console.log('\n❌ No hay token de confirmación');
        console.log('Esto puede indicar que el usuario ya fue confirmado o hubo un error');
      }
      
    } else {
      console.log('❌ No se encontraron usuarios');
    }
    
  } catch (error) {
    console.error('❌ Error verificando token:', error);
  } finally {
    await pool.end();
  }
}

checkConfirmationToken(); 