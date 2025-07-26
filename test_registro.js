import fetch from 'node-fetch';

async function testRegistro() {
  console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE REGISTRO\n');
  
  // Datos de prueba únicos
  const timestamp = Date.now();
  const dni = `TEST${timestamp.toString().slice(-6)}`;
  const email = `test${timestamp}@sdo.gob.ar`;
  const username = dni;
  
  console.log('📋 Datos de prueba:');
  console.log(`DNI: ${dni}`);
  console.log(`Email: ${email}`);
  console.log(`Username: ${username}`);
  console.log('');
  
  try {
    // 1. Probar conexión al servidor
    console.log('1️⃣ Probando conexión al servidor...');
    const healthCheck = await fetch('https://tablero-control-1.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' })
    });
    
    if (healthCheck.status === 401) {
      console.log('✅ Servidor responde correctamente');
    } else {
      console.log('⚠️ Servidor responde con status:', healthCheck.status);
    }
    
    // 2. Probar registro
    console.log('\n2️⃣ Probando registro de usuario...');
    const registerResponse = await fetch('https://tablero-control-1.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni: dni,
        nombre: 'Usuario',
        apellido: 'Prueba',
        funcion: 'Médico',
        email: email,
        username: username
      }),
    });
    
    console.log('Status:', registerResponse.status);
    const registerData = await registerResponse.json();
    console.log('Respuesta:', JSON.stringify(registerData, null, 2));
    
    if (registerData.success) {
      console.log('✅ Registro exitoso!');
      
      // 3. Probar login después del registro
      console.log('\n3️⃣ Probando login después del registro...');
      const loginResponse = await fetch('https://tablero-control-1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username, 
          password: dni // La contraseña es el DNI
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Status login:', loginResponse.status);
      console.log('Respuesta login:', JSON.stringify(loginData, null, 2));
      
      if (loginData.success) {
        console.log('✅ Login exitoso después del registro!');
      } else {
        console.log('❌ Login falló después del registro');
        console.log('💡 Posible problema: Usuario no está activo o necesita confirmación');
      }
      
    } else {
      console.log('❌ Registro falló');
      console.log('💡 Error:', registerData.error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar prueba
testRegistro(); 