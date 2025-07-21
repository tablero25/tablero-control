const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupRealEmail() {
  console.log('📧 Configuración de Emails Reales - Tableros de Control\n');
  
  console.log('🎯 Opciones disponibles:');
  console.log('1. Gmail (Recomendado)');
  console.log('2. Outlook/Hotmail');
  console.log('3. Servidor SMTP personalizado');
  console.log('4. Cancelar\n');
  
  const option = await question('Selecciona una opción (1-4): ');
  
  if (option === '4') {
    console.log('❌ Configuración cancelada');
    rl.close();
    return;
  }
  
  let config = '';
  
  switch (option) {
    case '1':
      console.log('\n📧 Configurando Gmail...');
      console.log('\n📋 Pasos previos necesarios:');
      console.log('1. Habilita verificación en dos pasos en tu cuenta de Google');
      console.log('2. Genera una contraseña de aplicación para "Correo"');
      console.log('3. Copia la contraseña de 16 caracteres\n');
      
      const gmailUser = await question('Email de Gmail: ');
      const gmailPass = await question('Contraseña de aplicación (16 caracteres): ');
      
      config = `const nodemailer = require('nodemailer');

// Configuración del transportador de email para Gmail
const createTransporter = async () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: '${gmailUser}',
      pass: '${gmailPass}'
    }
  });
};

// Función para enviar email de confirmación
const sendConfirmationEmail = async (email, username, confirmationToken) => {
  try {
    const transporter = await createTransporter();
    
    const confirmationUrl = \`https://tablero-control-1.onrender.com/confirmar-usuario?token=\${confirmationToken}\`;
    
    const mailOptions = {
      from: '"Tableros de Control - SDO" <${gmailUser}>',
      to: email,
      subject: 'Confirmación de Registro - Tableros de Control',
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h2 style="color: #333; margin: 0;">Tableros de Control - Indicadores de Gestión</h2>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h3 style="color: #333;">¡Bienvenido al sistema!</h3>
            
            <p>Hola <strong>\${username}</strong>,</p>
            
            <p>Tu cuenta ha sido registrada exitosamente en el sistema de Tableros de Control.</p>
            
            <p>Para activar tu cuenta y comenzar a usar el sistema, por favor haz clic en el siguiente enlace:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="\${confirmationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Confirmar Mi Cuenta
              </a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">\${confirmationUrl}</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #333;">Información de acceso:</h4>
              <p><strong>Usuario:</strong> \${username}</p>
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
      \`
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
};`;
      break;
      
    case '2':
      console.log('\n📧 Configurando Outlook/Hotmail...');
      const outlookUser = await question('Email de Outlook/Hotmail: ');
      const outlookPass = await question('Contraseña: ');
      
      config = `const nodemailer = require('nodemailer');

// Configuración del transportador de email para Outlook
const createTransporter = async () => {
  return nodemailer.createTransporter({
    service: 'outlook',
    auth: {
      user: '${outlookUser}',
      pass: '${outlookPass}'
    }
  });
};

// Función para enviar email de confirmación
const sendConfirmationEmail = async (email, username, confirmationToken) => {
  try {
    const transporter = await createTransporter();
    
    const confirmationUrl = \`http://localhost:3000/confirmar-usuario?token=\${confirmationToken}\`;
    
    const mailOptions = {
      from: '"Tableros de Control - SDO" <${outlookUser}>',
      to: email,
      subject: 'Confirmación de Registro - Tableros de Control',
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h2 style="color: #333; margin: 0;">Tableros de Control - Indicadores de Gestión</h2>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h3 style="color: #333;">¡Bienvenido al sistema!</h3>
            
            <p>Hola <strong>\${username}</strong>,</p>
            
            <p>Tu cuenta ha sido registrada exitosamente en el sistema de Tableros de Control.</p>
            
            <p>Para activar tu cuenta y comenzar a usar el sistema, por favor haz clic en el siguiente enlace:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="\${confirmationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Confirmar Mi Cuenta
              </a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">\${confirmationUrl}</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #333;">Información de acceso:</h4>
              <p><strong>Usuario:</strong> \${username}</p>
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
      \`
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
};`;
      break;
      
    case '3':
      console.log('\n📧 Configurando servidor SMTP personalizado...');
      const smtpHost = await question('Servidor SMTP (ej: smtp.gmail.com): ');
      const smtpPort = await question('Puerto (ej: 587): ');
      const smtpUser = await question('Email: ');
      const smtpPass = await question('Contraseña: ');
      
      config = `const nodemailer = require('nodemailer');

// Configuración del transportador de email para SMTP personalizado
const createTransporter = async () => {
  return nodemailer.createTransporter({
    host: '${smtpHost}',
    port: ${smtpPort},
    secure: false,
    auth: {
      user: '${smtpUser}',
      pass: '${smtpPass}'
    }
  });
};

// Función para enviar email de confirmación
const sendConfirmationEmail = async (email, username, confirmationToken) => {
  try {
    const transporter = await createTransporter();
    
    const confirmationUrl = \`http://localhost:3000/confirmar-usuario?token=\${confirmationToken}\`;
    
    const mailOptions = {
      from: '"Tableros de Control - SDO" <${smtpUser}>',
      to: email,
      subject: 'Confirmación de Registro - Tableros de Control',
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h2 style="color: #333; margin: 0;">Tableros de Control - Indicadores de Gestión</h2>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h3 style="color: #333;">¡Bienvenido al sistema!</h3>
            
            <p>Hola <strong>\${username}</strong>,</p>
            
            <p>Tu cuenta ha sido registrada exitosamente en el sistema de Tableros de Control.</p>
            
            <p>Para activar tu cuenta y comenzar a usar el sistema, por favor haz clic en el siguiente enlace:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="\${confirmationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Confirmar Mi Cuenta
              </a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">\${confirmationUrl}</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #333;">Información de acceso:</h4>
              <p><strong>Usuario:</strong> \${username}</p>
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
      \`
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
};`;
      break;
      
    default:
      console.log('❌ Opción inválida');
      rl.close();
      return;
  }
  
  // Guardar configuración
  const configPath = path.join(__dirname, 'emailConfig.js');
  fs.writeFileSync(configPath, config);
  
  console.log('\n✅ Configuración guardada exitosamente!');
  console.log('📁 Archivo: emailConfig.js');
  console.log('\n🎯 Próximos pasos:');
  console.log('1. Reinicia el backend: node index.js');
  console.log('2. Prueba el registro: node test_email_unique.js');
  console.log('3. Verifica que el email llegue a tu bandeja de entrada');
  
  rl.close();
}

setupRealEmail(); 