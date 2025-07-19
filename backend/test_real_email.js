const { sendConfirmationEmail } = require('./emailConfig');

async function testRealEmail() {
  console.log('🧪 Probando envío de email real...\n');
  
  try {
    // Datos de prueba
    const testEmail = 'tu-email-de-prueba@gmail.com'; // Cambia por tu email
    const testUsername = 'Usuario de Prueba';
    const testToken = 'test-token-123456';
    
    console.log('📧 Enviando email de prueba...');
    console.log(`📬 Destinatario: ${testEmail}`);
    console.log(`👤 Usuario: ${testUsername}`);
    console.log(`🔗 Token: ${testToken}\n`);
    
    const result = await sendConfirmationEmail(testEmail, testUsername, testToken);
    
    console.log('✅ Email enviado exitosamente!');
    console.log(`📨 Message ID: ${result.messageId}`);
    console.log('\n🎯 Verifica tu bandeja de entrada para confirmar que el email llegó.');
    console.log('📋 El email debe contener:');
    console.log('   - Asunto: "Confirmación de Registro - Tableros de Control"');
    console.log('   - Enlace de confirmación');
    console.log('   - Información de acceso');
    
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Posibles soluciones:');
      console.log('1. Verifica que el email y contraseña sean correctos');
      console.log('2. Para Gmail, asegúrate de usar contraseña de aplicación');
      console.log('3. Verifica que la verificación en dos pasos esté habilitada');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Posibles soluciones:');
      console.log('1. Verifica tu conexión a internet');
      console.log('2. Asegúrate de que el puerto 587 no esté bloqueado');
      console.log('3. Verifica la configuración del servidor SMTP');
    }
  }
}

// Verificar que el archivo de configuración existe
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'emailConfig.js');

if (!fs.existsSync(configPath)) {
  console.log('❌ No se encontró el archivo emailConfig.js');
  console.log('📋 Ejecuta primero: node setup_real_email.js');
  process.exit(1);
}

testRealEmail(); 