const { Pool } = require('pg');

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateDatabase() {
  try {
    console.log('🔧 Actualizando base de datos para soporte de confirmación por email...');
    
    // Verificar si la columna confirmation_token ya existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'confirmation_token'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('➕ Agregando columna confirmation_token...');
      
      // Agregar columna confirmation_token
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN confirmation_token VARCHAR(255)
      `);
      
      console.log('✅ Columna confirmation_token agregada exitosamente');
    } else {
      console.log('ℹ️  La columna confirmation_token ya existe');
    }
    
    // Verificar si la columna is_active existe
    const checkIsActive = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'is_active'
    `);
    
    if (checkIsActive.rows.length === 0) {
      console.log('➕ Agregando columna is_active...');
      
      // Agregar columna is_active
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN is_active BOOLEAN DEFAULT true
      `);
      
      console.log('✅ Columna is_active agregada exitosamente');
    } else {
      console.log('ℹ️  La columna is_active ya existe');
    }
    
    // Actualizar usuarios existentes para que estén activos
    const updateResult = await pool.query(`
      UPDATE users 
      SET is_active = true 
      WHERE is_active IS NULL
    `);
    
    console.log(`✅ ${updateResult.rowCount} usuarios actualizados para estar activos`);
    
    console.log('🎉 Base de datos actualizada exitosamente para soporte de confirmación por email');
    
  } catch (error) {
    console.error('❌ Error actualizando base de datos:', error);
  } finally {
    await pool.end();
  }
}

updateDatabase(); 