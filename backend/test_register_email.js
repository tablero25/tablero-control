const { sendConfirmationEmail } = require('./emailService');

async function testRegisterEmail() {
  try {
    console.log('🔧 Probando email de registro...');
    
    const testEmail = 'ddpproyectos2025@gmail.com';
    const testToken = 'test-token-12345';
    const testNombre = 'Usuario de Prueba';
    
    console.log('📧 Enviando email de confirmación a:', testEmail);
    
    const result = await sendConfirmationEmail(testEmail, testToken, testNombre);
    
    if (result.success) {
      console.log('✅ Email de confirmación enviado exitosamente!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Revisa tu bandeja de entrada en:', testEmail);
    } else {
      console.log('❌ Error enviando email de confirmación:');
      console.log('🔍 Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testRegisterEmail(); 