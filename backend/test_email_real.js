const { sendConfirmationEmail } = require('./emailConfig');

async function testRealEmail() {
  console.log('🧪 Probando envío de email real con Gmail...\n');
  
  try {
    // Datos de prueba - usa tu email real para recibir la prueba
    const testEmail = 'ddpproyectos2025@gmail.com'; // Email de prueba
    const testUsername = 'Usuario de Prueba';
    const testToken = 'test-token-123456';
    
    console.log('📧 Enviando email de prueba...');
    console.log(`📬 Destinatario: ${testEmail}`);
    console.log(`👤 Usuario: ${testUsername}`);
    console.log(`🔗 Token: ${testToken}\n`);
    
    const result = await sendConfirmationEmail(testEmail, testUsername, testToken);
    
    console.log('✅ Email enviado exitosamente!');
    console.log(`📨 Message ID: ${result.messageId}`);
    console.log('\n🎯 Verifica tu bandeja de entrada en Gmail para confirmar que el email llegó.');
    console.log('📋 El email debe contener:');
    console.log('   - Asunto: "Confirmación de Registro - Tableros de Control"');
    console.log('   - Enlace de confirmación');
    console.log('   - Información de acceso');
    console.log('\n📧 Si no ves el email, revisa la carpeta de spam.');
    
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Error de autenticación:');
      console.log('1. Verifica que el email y contraseña sean correctos');
      console.log('2. Asegúrate de usar contraseña de aplicación, no tu contraseña principal');
      console.log('3. Verifica que la verificación en dos pasos esté habilitada');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Error de conexión:');
      console.log('1. Verifica tu conexión a internet');
      console.log('2. Asegúrate de que el puerto 587 no esté bloqueado');
    } else {
      console.log('\n🔧 Otros posibles problemas:');
      console.log('1. Verifica que la contraseña de aplicación sea correcta');
      console.log('2. Asegúrate de que no haya espacios extra en la contraseña');
      console.log('3. Verifica que el email esté bien escrito');
    }
  }
}

testRealEmail(); 