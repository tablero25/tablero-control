const { Client } = require('pg');

// Configurar la URL de la base de datos
process.env.DATABASE_URL = 'postgresql://tablero_user:zdR9rbB8bhIke5DC706ANbxVnJ0PvJrM@dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com/tablero_user';

async function fixDatabase() {
  // Usar la misma configuración que db.js
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    // Verificar estructura actual
    console.log('\n📋 Verificando estructura actual de la tabla users...');
    const currentStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura actual:');
    currentStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Agregar columnas faltantes
    console.log('\n🔧 Agregando columnas faltantes...');

    // Verificar si password_hash existe
    const hasPasswordHash = currentStructure.rows.some(row => row.column_name === 'password_hash');
    if (!hasPasswordHash) {
      await client.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);');
      console.log('✅ Agregada columna password_hash');
    } else {
      console.log('⚠️  Columna password_hash ya existe');
    }

    // Verificar si role existe
    const hasRole = currentStructure.rows.some(row => row.column_name === 'role');
    if (!hasRole) {
      await client.query('ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT \'ESTABLECIMIENTO\';');
      console.log('✅ Agregada columna role');
    } else {
      console.log('⚠️  Columna role ya existe');
    }

    // Verificar si is_active existe
    const hasIsActive = currentStructure.rows.some(row => row.column_name === 'is_active');
    if (!hasIsActive) {
      await client.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;');
      console.log('✅ Agregada columna is_active');
    } else {
      console.log('⚠️  Columna is_active ya existe');
    }

    // Verificar si first_login existe
    const hasFirstLogin = currentStructure.rows.some(row => row.column_name === 'first_login');
    if (!hasFirstLogin) {
      await client.query('ALTER TABLE users ADD COLUMN first_login BOOLEAN DEFAULT TRUE;');
      console.log('✅ Agregada columna first_login');
    } else {
      console.log('⚠️  Columna first_login ya existe');
    }

    // Verificar estructura final
    console.log('\n📋 Verificando estructura final...');
    const finalStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura final:');
    finalStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
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