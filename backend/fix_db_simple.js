const { Client } = require('pg');

async function fixDatabase() {
  // Usar la configuración exacta que funcionó en PSQL
  const client = new Client({
    host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
    port: 5432,
    database: 'tablero_user',
    user: 'tablero_user',
    password: 'zdR9rbB8bhIke5DC706ANbxVnJ0PvJrM',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    // Verificar estructura actual
    console.log('\n📋 Verificando estructura actual...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Columnas actuales:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    // Agregar columnas faltantes
    console.log('\n🔧 Agregando columnas faltantes...');

    const columnsToAdd = [
      { name: 'password_hash', type: 'VARCHAR(255)' },
      { name: 'role', type: 'VARCHAR(20) DEFAULT \'ESTABLECIMIENTO\'' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'first_login', type: 'BOOLEAN DEFAULT TRUE' }
    ];

    for (const column of columnsToAdd) {
      const exists = result.rows.some(row => row.column_name === column.name);
      if (!exists) {
        await client.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type};`);
        console.log(`✅ Agregada columna ${column.name}`);
      } else {
        console.log(`⚠️  Columna ${column.name} ya existe`);
      }
    }

    // Verificar estructura final
    console.log('\n📋 Verificando estructura final...');
    const finalResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura final:');
    finalResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n🎉 ¡Base de datos arreglada exitosamente!');
    console.log('💡 Ahora puedes registrar usuarios normalmente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

fixDatabase(); 