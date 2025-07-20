const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Usuario de prueba creado:');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');
    console.log('Hash de contraseña:', hashedPassword);
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser(); 