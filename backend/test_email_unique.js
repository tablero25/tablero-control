const fetch = require('node-fetch');

async function testEmailUnique() {
  console.log('📧 Probando envío de email de confirmación con datos únicos...\n');

  // Generar datos únicos basados en timestamp
  const timestamp = Date.now();
  const dni = `999${timestamp.toString().slice(-5)}`;
  const email = `test${timestamp}@sdo.gob.ar`;
  const username = dni;

  try {
    // Registrar un usuario con datos únicos
    console.log('1️⃣ Registrando usuario de prueba...');
    console.log(`👤 DNI: ${dni}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🏥 Establecimiento: 25 San Carlos`);
    
    const registerResponse = await fetch('https://tablero-control-1.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni: dni,
        nombre: 'Usuario',
        apellido: 'Prueba',
        funcion: 'Médico',
        email: email,
        username: username,
        establecimiento: '25 San Carlos'
      }),
    });

    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('\n✅ Usuario registrado exitosamente!');
      console.log('👤 Usuario:', registerData.user.username);
      console.log('📧 Email:', registerData.user.email);
      console.log('📝 Mensaje:', registerData.message);
      
      console.log('\n📋 IMPORTANTE - Sobre los emails:');
      console.log('🔍 En desarrollo, los emails se envían a Ethereal Email (servicio de prueba)');
      console.log('📧 Los emails NO llegan realmente a tu bandeja de entrada');
      console.log('🔗 Para ver el email, revisa la consola del backend');
      console.log('🌐 Busca una línea que diga: "URL de vista previa: https://ethereal.email/..."');
      console.log('👆 Haz clic en esa URL para ver el email de confirmación');
      
      console.log('\n🎯 Próximos pasos:');
      console.log('1. Revisa la consola donde está corriendo el backend (node index.js)');
      console.log('2. Busca la línea: "Email de confirmación enviado: [URL]"');
      console.log('3. Copia y pega esa URL en tu navegador');
      console.log('4. Haz clic en el enlace de confirmación en el email');
      console.log('5. Verifica que puedes hacer login después');
      
      console.log('\n🔍 Para encontrar el email en la consola del backend:');
      console.log('- Busca líneas que contengan "Email de confirmación enviado:"');
      console.log('- O busca líneas que contengan "https://ethereal.email/"');
      console.log('- La URL será algo como: https://ethereal.email/message/...');
      
    } else {
      console.log('❌ Error registrando usuario:', registerData.error);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }

  console.log('\n💡 Nota: Para producción, necesitarás configurar un servidor SMTP real');
  console.log('📖 Revisa el archivo emailConfig.js para más detalles');
}

testEmailUnique(); 