const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    console.log('🔧 Probando envío de email...');
    
    // Configuración del transportador de email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ddpproyectos2025@gmail.com',
        pass: 'qvce lang ajuu ptjl'
      }
    });
    
    const mailOptions = {
      from: 'ddpproyectos2025@gmail.com',
      to: 'ddpproyectos2025@gmail.com',
      subject: 'Prueba de Email - Sistema de Tableros SDO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">Sistema de Tableros SDO</h1>
              <p style="color: #7f8c8d; margin: 10px 0;">Secretaría de Desarrollo Organizacional</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">¡Email de Prueba!</h2>
              <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                Este es un email de prueba para verificar que el sistema de envío de emails está funcionando correctamente.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #27ae60; color: white; padding: 15px 30px; border-radius: 5px; display: inline-block; font-weight: bold;">
                ✅ Email Enviado Correctamente
              </div>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de prueba enviado exitosamente:', result.messageId);
    console.log('📧 Revisa tu bandeja de entrada en ddpproyectos2025@gmail.com');
    
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
    console.log('🔍 Detalles del error:', error.message);
  }
}

testEmail(); 