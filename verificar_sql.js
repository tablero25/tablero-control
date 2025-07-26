const { Pool } = require('pg');

// Configuración para la base de datos de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verificarSQL() {
  try {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS\n');
    
    // 1. Verificar conexión
    console.log('1️⃣ Probando conexión...');
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexión exitosa:', connectionTest.rows[0].current_time);
    
    // 2. Verificar si existe la tabla users
    console.log('\n2️⃣ Verificando tabla users...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Tabla users existe');
    } else {
      console.log('❌ Tabla users NO existe');
      return;
    }
    
    // 3. Verificar estructura de la tabla users
    console.log('\n3️⃣ Verificando estructura de la tabla users...');
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas encontradas:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // 4. Verificar campos requeridos para el registro
    console.log('\n4️⃣ Verificando campos requeridos para registro...');
    const requiredFields = ['dni', 'nombre', 'apellido', 'funcion', 'confirmation_token', 'confirmation_expires'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      const fieldExists = columns.rows.find(col => col.column_name === field);
      if (!fieldExists) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length === 0) {
      console.log('✅ Todos los campos requeridos están presentes');
    } else {
      console.log('❌ Campos faltantes:', missingFields.join(', '));
    }
    
    // 5. Verificar restricciones
    console.log('\n5️⃣ Verificando restricciones...');
    const constraints = await pool.query(`
      SELECT 
        constraint_name, 
        constraint_type,
        check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'users' 
      AND tc.table_schema = 'public'
    `);
    
    console.log('📋 Restricciones encontradas:');
    constraints.rows.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type} ${constraint.check_clause || ''}`);
    });
    
    // 6. Verificar índices
    console.log('\n6️⃣ Verificando índices...');
    const indexes = await pool.query(`
      SELECT 
        indexname, 
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'users'
    `);
    
    console.log('📋 Índices encontrados:');
    indexes.rows.forEach(index => {
      console.log(`   - ${index.indexname}`);
    });
    
    // 7. Verificar usuarios existentes
    console.log('\n7️⃣ Verificando usuarios existentes...');
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total de usuarios: ${users.rows[0].count}`);
    
    if (users.rows[0].count > 0) {
      const sampleUsers = await pool.query('SELECT username, email, role, is_active FROM users LIMIT 5');
      console.log('👥 Usuarios de ejemplo:');
      sampleUsers.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role} - ${user.is_active ? 'Activo' : 'Inactivo'}`);
      });
    }
    
    // 8. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(60));
    
    if (missingFields.length === 0) {
      console.log('✅ La estructura de la base de datos está CORRECTA');
      console.log('✅ El registro de usuarios debería funcionar');
    } else {
      console.log('❌ La estructura de la base de datos tiene PROBLEMAS');
      console.log('❌ Campos faltantes que impiden el registro');
      console.log('💡 Ejecuta el script de inicialización para arreglar');
    }
    
  } catch (error) {
    console.error('❌ Error verificando la base de datos:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar verificación
verificarSQL(); 