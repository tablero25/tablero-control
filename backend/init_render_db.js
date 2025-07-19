const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración para la base de datos de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tablero_user:zdR9rbB8bhIke5DC706ANbxVnJ0PvJrM@dpg-d1tfjure5dus73dhg1p0-a.oregon.render.com/tablero_user',
  ssl: {
    rejectUnauthorized: false
  }
});

async function initRenderDatabase() {
  try {
    console.log('🚀 Inicializando base de datos en Render.com...\n');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'init_render_database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Ejecutando script SQL...');
    
    // Ejecutar el script SQL
    const result = await pool.query(sqlContent);
    
    console.log('✅ Base de datos inicializada exitosamente!\n');
    
    // Verificar las tablas creadas
    console.log('🔍 Verificando tablas creadas...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Tablas encontradas:');
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Verificar usuarios creados
    console.log('\n👥 Verificando usuarios creados...');
    const usersResult = await pool.query('SELECT id, username, email, role, is_active FROM users');
    
    if (usersResult.rows.length > 0) {
      console.log('✅ Usuarios encontrados:');
      usersResult.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role} - ${user.is_active ? 'Activo' : 'Inactivo'}`);
      });
    } else {
      console.log('❌ No se encontraron usuarios');
    }
    
    // Verificar establecimientos creados
    console.log('\n🏥 Verificando establecimientos creados...');
    const establecimientosResult = await pool.query('SELECT id, nombre, zona, activo FROM establecimientos');
    
    if (establecimientosResult.rows.length > 0) {
      console.log('✅ Establecimientos encontrados:');
      establecimientosResult.rows.forEach(est => {
        console.log(`   - ${est.nombre} (${est.zona}) - ${est.activo ? 'Activo' : 'Inactivo'}`);
      });
    } else {
      console.log('❌ No se encontraron establecimientos');
    }
    
    console.log('\n🎉 ¡Inicialización completada!');
    console.log('📝 Credenciales de administrador:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Email: admin@sdo.gob.ar');
    
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initRenderDatabase()
    .then(() => {
      console.log('\n✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { initRenderDatabase }; 