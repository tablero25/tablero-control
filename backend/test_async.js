const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Iniciando prueba asíncrona...');

  try {
    console.log('✅ Nodemailer cargado correctamente');
    
    console.log('📧 Configurando transportador...');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'ddpproyectos2025@gmail.com',
        pass: 'bsmp kwav exac hcrs'
      }
    });
    
    console.log('✅ Transportador configurado');
    
    console.log('📤 Enviando email...');
    const mailOptions = {
      from: '"Prueba" <ddpproyectos2025@gmail.com>',
      to: 'ddpproyectos2025@gmail.com',
      subject: 'Prueba Asíncrona - Tableros de Control',
      text: 'Este es un email de prueba para verificar que la configuración funciona correctamente.'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Verifica tu bandeja de entrada en Gmail');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('🔍 Detalles:', error);
  }
}

testEmail(); 