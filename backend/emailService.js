const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'ddpproyectos2025@gmail.com',
    pass: process.env.EMAIL_PASS || 'qvce lang ajuu ptjl'
  }
});

// Función para generar token de confirmación
function generateConfirmationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Función para enviar email de confirmación
async function sendConfirmationEmail(email, token, nombre) {
  const confirmationUrl = `https://tablero-control-1.onrender.com/confirmar/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'ddpproyectos2025@gmail.com',
    to: email,
    subject: 'Confirmación de cuenta - SDO Tablero de Control',
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

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado a:', email);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
}

// Función para verificar token de confirmación
async function verifyConfirmationToken(token, pool) {
  try {
    const result = await pool.query(
      'SELECT id, email, nombre, confirmation_expires FROM users WHERE confirmation_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return { valid: false, message: 'Token inválido' };
    }

    const user = result.rows[0];
    const now = new Date();
    const expires = new Date(user.confirmation_expires);

    if (now > expires) {
      return { valid: false, message: 'Token expirado' };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('Error verificando token:', error);
    return { valid: false, message: 'Error interno' };
  }
}

module.exports = {
  generateConfirmationToken,
  sendConfirmationEmail,
  verifyConfirmationToken
}; 