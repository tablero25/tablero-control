const { Pool } = require('pg');

// Configuración para la base de datos de Render
const pool = new Pool({
  connectionString: 'postgresql://tablero_user:zdR9rbB8bhIke5DC706ANbxVnJ0PvJrM@dpg-d1tfjure5dus73dhg1p0-a.oregon.render.com/tablero_user',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixDatabaseStructure() {
  try {
    console.log('🔧 CORRIGIENDO ESTRUCTURA DE LA BASE DE DATOS\n');
    
    // 1. Verificar estructura actual
    console.log('1️⃣ Verificando estructura actual...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas actuales:');
    tableInfo.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    console.log('');
    
    // 2. Agregar columnas faltantes
    console.log('2️⃣ Agregando columnas faltantes...');
    
    const columnsToAdd = [
      { name: 'password_hash', type: 'VARCHAR(255)', nullable: 'NOT NULL' },
      { name: 'role', type: 'VARCHAR(20)', nullable: 'DEFAULT \'ESTABLECIMIENTO\'' },
      { name: 'is_active', type: 'BOOLEAN', nullable: 'DEFAULT TRUE' },
      { name: 'first_login', type: 'BOOLEAN', nullable: 'DEFAULT TRUE' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: 'DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    for (const column of columnsToAdd) {
      const columnExists = tableInfo.rows.some(row => row.column_name === column.name);
      
      if (!columnExists) {
        console.log(`Agregando columna: ${column.name}`);
        try {
          await pool.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type} ${column.nullable}`);
          console.log(`✅ Columna ${column.name} agregada`);
        } catch (error) {
          console.log(`⚠️  Error agregando ${column.name}:`, error.message);
        }
      } else {
        console.log(`✅ Columna ${column.name} ya existe`);
      }
    }
    
    // 3. Verificar estructura final
    console.log('\n3️⃣ Verificando estructura final...');
    const finalTableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Estructura final:');
    finalTableInfo.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
    console.log('\n✅ Estructura de base de datos corregida');
    
  } catch (error) {
    console.error('❌ Error corrigiendo estructura:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseStructure(); 