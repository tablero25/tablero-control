const fetch = require('node-fetch');

async function testEmailConfirmation() {
  console.log('🧪 Probando el sistema de confirmación por email...\n');

  try {
    // 1. Probar registro de usuario
    console.log('1️⃣ Registrando un usuario de prueba...');
    const registerResponse = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni: '99999999',
        nombre: 'Usuario',
        apellido: 'Prueba',
        funcion: 'Tester',
        email: 'test@sdo.gob.ar',
        username: '99999999',
        establecimiento: '25 San Carlos'
      }),
    });

    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ Usuario registrado exitosamente');
      console.log('📧 Email de confirmación enviado');
      console.log('👤 Usuario creado:', registerData.user);
      
      // 2. Probar login sin confirmar (debería fallar)
      console.log('\n2️⃣ Intentando login sin confirmar (debería fallar)...');
      const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: '99999999',
          password: '99999999'
        }),
      });

      const loginData = await loginResponse.json();
      
      if (!loginData.success) {
        console.log('✅ Login bloqueado correctamente (usuario no confirmado)');
        console.log('❌ Error esperado:', loginData.error);
      } else {
        console.log('❌ Error: El usuario pudo hacer login sin confirmar');
      }

      // 3. Probar reenvío de email de confirmación
      console.log('\n3️⃣ Probando reenvío de email de confirmación...');
      const resendResponse = await fetch('http://localhost:5001/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@sdo.gob.ar'
        }),
      });

      const resendData = await resendResponse.json();
      
      if (resendData.success) {
        console.log('✅ Email de confirmación reenviado exitosamente');
      } else {
        console.log('❌ Error reenviando email:', resendData.error);
      }

    } else {
      console.log('❌ Error registrando usuario:', registerData.error);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }

  console.log('\n🎯 Prueba completada. Revisa la consola del backend para ver los emails enviados.');
  console.log('📧 Los emails se envían a Ethereal Email (email de prueba)');
  console.log('🔗 La URL de vista previa aparecerá en la consola del backend');
}

// Ejecutar la prueba
testEmailConfirmation(); 