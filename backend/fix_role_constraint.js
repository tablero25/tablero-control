const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tablero_control',
  password: '123456',
  port: 5432,
});

async function fixRoleConstraint() {
  console.log('🔧 Arreglando restricción CHECK del campo role...\n');
  
  try {
    // Verificar la restricción actual
    console.log('📋 Verificando restricción actual...');
    const checkResult = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conname = 'users_role_check'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Restricción encontrada:', checkResult.rows[0].definition);
    } else {
      console.log('❌ No se encontró la restricción users_role_check');
    }
    
    // Eliminar la restricción actual si existe
    console.log('\n🗑️ Eliminando restricción actual...');
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    console.log('✅ Restricción eliminada');
    
    // Crear la nueva restricción con todos los roles
    console.log('\n➕ Creando nueva restricción...');
    await pool.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA'))
    `);
    console.log('✅ Nueva restricción creada');
    
    // Verificar que se creó correctamente
    console.log('\n📋 Verificando nueva restricción...');
    const newCheckResult = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conname = 'users_role_check'
    `);
    
    if (newCheckResult.rows.length > 0) {
      console.log('✅ Nueva restricción:', newCheckResult.rows[0].definition);
    }
    
    // Verificar usuarios existentes
    console.log('\n👥 Verificando usuarios existentes...');
    const usersResult = await pool.query('SELECT id, username, role, is_active FROM users ORDER BY id DESC LIMIT 5');
    
    if (usersResult.rows.length > 0) {
      console.log('📋 Usuarios más recientes:');
      usersResult.rows.forEach(user => {
        console.log(`   ID: ${user.id}, Usuario: ${user.username}, Rol: ${user.role}, Activo: ${user.is_active}`);
      });
    } else {
      console.log('📋 No hay usuarios en la base de datos');
    }
    
    console.log('\n✅ Restricción de roles arreglada exitosamente!');
    console.log('🎯 Ahora puedes registrar usuarios con cualquier rol válido:');
    console.log('   - ADMIN');
    console.log('   - SUPERVISOR');
    console.log('   - ESTABLECIMIENTO');
    console.log('   - JEFE_ZONA');
    
  } catch (error) {
    console.error('❌ Error arreglando restricción:', error.message);
  } finally {
    await pool.end();
  }
}

fixRoleConstraint(); 