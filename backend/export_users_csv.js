const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'luxiot',
  host: 'tablero-control-1.onrender.com',
  database: 'sdo_tablero',
  password: 'Sistema2025',
  port: 5432,
});

async function exportUsersToCSV() {
  try {
    console.log('📊 Exportando usuarios a CSV...\n');
    
    // Consulta para obtener todos los usuarios
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
      console.log('❌ No se encontraron usuarios para exportar.');
      return;
    }

    // Crear contenido CSV
    const headers = [
      'ID',
      'Usuario',
      'Email',
      'DNI',
      'Nombre',
      'Apellido',
      'Función',
      'Rol',
      'Estado',
      'Primer Login',
      'Establecimientos',
      'Fecha Creación'
    ];

    const csvRows = [headers.join(',')];

    result.rows.forEach(user => {
      const row = [
        user.id,
        `"${user.username || ''}"`,
        `"${user.email || ''}"`,
        `"${user.dni || ''}"`,
        `"${user.nombre || ''}"`,
        `"${user.apellido || ''}"`,
        `"${user.funcion || ''}"`,
        `"${user.role || ''}"`,
        user.is_active ? 'Activo' : 'Inactivo',
        user.first_login ? 'Sí' : 'No',
        user.establecimientos_count || 0,
        user.created_at ? new Date(user.created_at).toLocaleString('es-AR') : ''
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    
    // Crear directorio si no existe
    const exportDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `usuarios_export_${timestamp}.csv`;
    const filepath = path.join(exportDir, filename);

    // Escribir archivo CSV
    fs.writeFileSync(filepath, csvContent, 'utf8');

    console.log(`✅ Exportación completada exitosamente!`);
    console.log(`📁 Archivo guardado en: ${filepath}`);
    console.log(`📊 Total de usuarios exportados: ${result.rows.length}`);

    // Mostrar resumen
    const roleCount = {};
    result.rows.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });

    console.log('\n📈 Resumen de la exportación:');
    console.log('   ┌─────────────────────────────────');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   │ ${role}: ${count} usuarios`);
    });
    console.log(`   │ Total: ${result.rows.length} usuarios`);
    console.log('   └─────────────────────────────────');

  } catch (error) {
    console.error('❌ Error exportando usuarios:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la función
exportUsersToCSV(); 