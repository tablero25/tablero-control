const fs = require('fs');
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

async function configurarGmail() {
  console.log('📧 Configuración de Gmail para Emails Reales\n');
  
  console.log('📋 ANTES DE CONTINUAR, necesitas:');
  console.log('1. Habilitar verificación en dos pasos en tu cuenta de Google');
  console.log('2. Generar contraseña de aplicación para "Correo"');
  console.log('3. Tener la contraseña de 16 caracteres lista\n');
  
  const continuar = await question('¿Ya tienes la contraseña de aplicación? (s/n): ');
  
  if (continuar.toLowerCase() !== 's') {
    console.log('\n❌ Por favor, configura primero tu cuenta de Google:');
    console.log('1. Ve a: https://myaccount.google.com/');
    console.log('2. Seguridad → Verificación en dos pasos');
    console.log('3. Contraseñas de aplicación → Correo → Windows');
    console.log('4. Copia la contraseña de 16 caracteres');
    rl.close();
    return;
  }
  
  console.log('\n📧 Ingresa tus datos de Gmail:');
  const email = await question('Email de Gmail: ');
  const password = await question('Contraseña de aplicación (16 caracteres): ');
  
  // Leer el archivo actual
  let configContent = fs.readFileSync('emailConfig.js', 'utf8');
  
  // Reemplazar las credenciales
  configContent = configContent.replace(/user: 'tu-email@gmail.com'/g, `user: '${email}'`);
  configContent = configContent.replace(/pass: 'tu-contraseña-de-aplicacion'/g, `pass: '${password}'`);
  configContent = configContent.replace(/<tu-email@gmail.com>/g, `<${email}>`);
  
  // Guardar el archivo
  fs.writeFileSync('emailConfig.js', configContent);
  
  console.log('\n✅ Configuración guardada exitosamente!');
  console.log(`📧 Email configurado: ${email}`);
  console.log('\n🎯 Próximos pasos:');
  console.log('1. Reinicia el backend: node index.js');
  console.log('2. Prueba el registro desde el frontend');
  console.log('3. Verifica que el email llegue a tu bandeja de entrada');
  
  rl.close();
}

configurarGmail(); 