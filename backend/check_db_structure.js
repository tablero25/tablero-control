const pool = require('./db');

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');
    
    // Verificar tablas existentes
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas existentes:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Verificar estructura de cada tabla
    for (const table of tables.rows) {
      console.log(`\n🔍 Estructura de la tabla ${table.table_name}:`);
      
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
    
    // Verificar datos existentes
    for (const table of tables.rows) {
      const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      console.log(`\n📊 Datos en ${table.table_name}: ${count.rows[0].count} registros`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure(); 