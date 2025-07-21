const nodemailer = require('nodemailer');

// Configuración del transportador de email
// Para Gmail, necesitas habilitar "Acceso de apps menos seguras" o usar contraseñas de aplicación
const createTransporter = async () => {
  // Configuración para Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ddpproyectos2025@gmail.com', // Cambia por tu email de Gmail
      pass: 'bsmp kwav exac hcrs' // Cambia por tu contraseña de aplicación
    }
  });
};

// Función para enviar email de confirmación
const sendConfirmationEmail = async (email, username, confirmationToken) => {
  try {
    const transporter = await createTransporter();
    
    const confirmationUrl = `https://tablero-control-1.onrender.com/confirmar-usuario?token=${confirmationToken}`;
    
    const mailOptions = {
      from: '"Tableros de Control - SDO" <ddpproyectos2025@gmail.com>', // Cambia por tu email
      to: email,
      subject: 'Confirmación de Registro - Tableros de Control',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h2 style="color: #333; margin: 0;">Tableros de Control - Indicadores de Gestión</h2>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h3 style="color: #333;">¡Bienvenido al sistema!</h3>
            
            <p>Hola <strong>${username}</strong>,</p>
            
            <p>Tu cuenta ha sido registrada exitosamente en el sistema de Tableros de Control.</p>
            
            <p>Para activar tu cuenta y comenzar a usar el sistema, por favor haz clic en el siguiente enlace:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Confirmar Mi Cuenta
              </a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${confirmationUrl}</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #333;">Información de acceso:</h4>
              <p><strong>Usuario:</strong> ${username}</p>
              <p><strong>Contraseña inicial:</strong> Tu DNI</p>
              <p><em>Recuerda cambiar tu contraseña después del primer inicio de sesión.</em></p>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Si no solicitaste este registro, puedes ignorar este email.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2024 Secretaría de Desarrollo Organizacional - Gobierno de Salta</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado exitosamente:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};

module.exports = {
  sendConfirmationEmail
}; 