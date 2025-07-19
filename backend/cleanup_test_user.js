const pool = require('./db');

async function cleanupTestUser() {
  try {
    console.log('🧹 Limpiando usuario de prueba...\n');
    
    // Eliminar usuario de prueba
    const deleteResult = await pool.query(
      'DELETE FROM users WHERE username = $1',
      ['99999999']
    );
    
    console.log(`✅ Usuario de prueba eliminado. Filas afectadas: ${deleteResult.rowCount}`);
    
    // Verificar que se eliminó
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['99999999']
    );
    
    if (checkResult.rows.length === 0) {
      console.log('✅ Usuario de prueba eliminado correctamente');
    } else {
      console.log('❌ Error: El usuario de prueba aún existe');
    }
    
  } catch (error) {
    console.error('❌ Error limpiando usuario:', error);
  } finally {
    await pool.end();
  }
}

cleanupTestUser(); 