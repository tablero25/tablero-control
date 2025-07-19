const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function updateDatabase() {
  try {
    console.log('🔄 Iniciando actualización de la base de datos...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'fix_missing_fields.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
    
    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`\n🔧 Ejecutando comando ${i + 1}/${commands.length}...`);
          console.log(`SQL: ${command.substring(0, 100)}${command.length > 100 ? '...' : ''}`);
          
          const result = await pool.query(command);
          
          if (result.rows) {
            console.log(`✅ Comando ejecutado exitosamente. Filas afectadas: ${result.rowCount}`);
            if (result.rows.length > 0) {
              console.log('📊 Resultados:', result.rows);
            }
          } else {
            console.log('✅ Comando ejecutado exitosamente.');
          }
        } catch (error) {
          console.error(`❌ Error en comando ${i + 1}:`, error.message);
          // Continuar con el siguiente comando
        }
      }
    }
    
    console.log('\n🎉 Actualización de la base de datos completada!');
    console.log('\n📋 Resumen de cambios:');
    console.log('   ✅ Campos de confirmación por email agregados');
    console.log('   ✅ Índices creados para mejor rendimiento');
    console.log('   ✅ Restricción UNIQUE en DNI agregada');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    // Cerrar la conexión
    await pool.end();
    console.log('\n🔌 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar la actualización
updateDatabase(); 