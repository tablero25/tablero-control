const { Pool } = require('pg');

const pool = new Pool({
  user: 'luxiot',
  host: 'tablero-control-1.onrender.com',
  database: 'sdo_tablero',
  password: 'Sistema2025',
  port: 5432,
});

async function extractUsers() {
  try {
    console.log('🔍 Extrayendo usuarios de la base de datos...\n');
    
    // Consulta para obtener todos los usuarios con información completa
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        u.dni,
        u.nombre,
        u.apellido,
        u.funcion,
        u.first_login,
        COUNT(ue.establecimiento_id) as establecimientos_count
      FROM users u
      LEFT JOIN user_establecimientos ue ON u.id = ue.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos.');
      return;
    }

    console.log(`✅ Se encontraron ${result.rows.length} usuarios:\n`);
    console.log('='.repeat(120));
    console.log('LISTADO DE USUARIOS EN LA BASE DE DATOS');
    console.log('='.repeat(120));

    result.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. USUARIO ID: ${user.id}`);
      console.log('   ┌─────────────────────────────────────────────────────────────────────────────────');
      console.log(`   │ Usuario: ${user.username || 'N/A'}`);
      console.log(`   │ Email: ${user.email || 'N/A'}`);
      console.log(`   │ DNI: ${user.dni || 'N/A'}`);
      console.log(`   │ Nombre: ${user.nombre || 'N/A'}`);
      console.log(`   │ Apellido: ${user.apellido || 'N/A'}`);
      console.log(`   │ Función: ${user.funcion || 'N/A'}`);
      console.log(`   │ Rol: ${user.role || 'N/A'}`);
      console.log(`   │ Estado: ${user.is_active ? '✅ Activo' : '❌ Inactivo'}`);
      console.log(`   │ Primer Login: ${user.first_login ? '🆕 Sí' : '✅ No'}`);
      console.log(`   │ Establecimientos: ${user.establecimientos_count || 0}`);
      console.log(`   │ Fecha Creación: ${user.created_at ? new Date(user.created_at).toLocaleString('es-AR') : 'N/A'}`);
      console.log('   └─────────────────────────────────────────────────────────────────────────────────');
    });

    // Resumen por roles
    const roleCount = {};
    result.rows.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });

    console.log('\n' + '='.repeat(50));
    console.log('RESUMEN POR ROLES');
    console.log('='.repeat(50));
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} usuarios`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('ESTADÍSTICAS GENERALES');
    console.log('='.repeat(50));
    console.log(`   Total de usuarios: ${result.rows.length}`);
    console.log(`   Usuarios activos: ${result.rows.filter(u => u.is_active).length}`);
    console.log(`   Usuarios inactivos: ${result.rows.filter(u => !u.is_active).length}`);
    console.log(`   Primer login pendiente: ${result.rows.filter(u => u.first_login).length}`);

  } catch (error) {
    console.error('❌ Error extrayendo usuarios:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la función
extractUsers(); 