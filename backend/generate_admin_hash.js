const bcrypt = require('bcryptjs');

async function generateAdminHash() {
  try {
    console.log('🔐 Generando hash para usuario admin...\n');
    
    const password = 'admin123';
    const saltRounds = 10;
    
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Hash generado exitosamente!');
    console.log(`📝 Contraseña: ${password}`);
    console.log(`🔑 Hash: ${hash}`);
    
    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(password, hash);
    console.log(`✅ Verificación: ${isValid ? 'CORRECTO' : 'INCORRECTO'}`);
    
    console.log('\n📋 Para usar en el script SQL:');
    console.log(`INSERT INTO users (username, password_hash, email, role, is_active, dni, nombre, apellido, funcion, first_login) VALUES`);
    console.log(`('admin', '${hash}', 'admin@sdo.gob.ar', 'ADMIN', true, '12345678', 'Administrador', 'Sistema', 'Administrador General', false);`);
    
  } catch (error) {
    console.error('❌ Error generando hash:', error);
  }
}

generateAdminHash(); 