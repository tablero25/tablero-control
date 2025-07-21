const nodemailer = require('nodemailer');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ddpproyectos2025@gmail.com',
    pass: 'qvce lang ajuu ptjl'
  }
});

// Función para enviar email de confirmación
const sendConfirmationEmail = async (email, confirmationToken, nombre) => {
  try {
    console.log('📧 [emailService] Iniciando envío de email de confirmación');
    console.log('📧 [emailService] Email destino:', email);
    console.log('📧 [emailService] Token:', confirmationToken);
    console.log('📧 [emailService] Nombre:', nombre);
    
    const confirmationUrl = `https://tablero-control-1.onrender.com/confirm?token=${confirmationToken}`;
    console.log('📧 [emailService] URL de confirmación:', confirmationUrl);
    
    const mailOptions = {
      from: 'ddpproyectos2025@gmail.com',
      to: email,
      subject: 'Confirmación de Registro - Sistema de Tableros SDO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">Sistema de Tableros SDO</h1>
              <p style="color: #7f8c8d; margin: 10px 0;">Secretaría de Desarrollo Organizacional</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">¡Bienvenido/a, ${nombre}!</h2>
              <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                Gracias por registrarte en el Sistema de Tableros de Control de la Secretaría de Desarrollo Organizacional.
                Para completar tu registro y activar tu cuenta, por favor confirma tu dirección de email.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Confirmar Mi Cuenta
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">
                Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:
              </p>
              <p style="color: #3498db; font-size: 14px; word-break: break-all;">
                ${confirmationUrl}
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                Este email fue enviado automáticamente. Por favor no respondas a este mensaje.
                <br>
                Si no solicitaste este registro, puedes ignorar este email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('📧 [emailService] Intentando enviar email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ [emailService] Email de confirmación enviado exitosamente a:', email);
    console.log('✅ [emailService] Message ID:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ [emailService] Error enviando email de confirmación:', error);
    console.error('❌ [emailService] Detalles del error:', error.message);
    console.error('❌ [emailService] Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
};

// Función para enviar email de bienvenida después de confirmación
const sendWelcomeEmail = async (email, nombre) => {
  try {
    const loginUrl = 'https://tablero-control-1.onrender.com';
    
    const mailOptions = {
      from: 'ddpproyectos2025@gmail.com',
      to: email,
      subject: '¡Cuenta Confirmada! - Sistema de Tableros SDO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #27ae60; margin: 0;">¡Cuenta Confirmada!</h1>
              <p style="color: #7f8c8d; margin: 10px 0;">Sistema de Tableros SDO</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">¡Felicidades, ${nombre}!</h2>
              <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                Tu cuenta ha sido confirmada exitosamente. Ya puedes acceder al Sistema de Tableros de Control
                de la Secretaría de Desarrollo Organizacional.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Acceder al Sistema
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">
                Si tienes alguna pregunta o necesitas ayuda, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de bienvenida enviado a:', email);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendConfirmationEmail,
  sendWelcomeEmail
}; 