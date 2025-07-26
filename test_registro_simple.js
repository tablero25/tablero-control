const https = require('https');

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'tablero-control-1.onrender.com',
      port: 443,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

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
    const healthCheck = await makeRequest('/api/auth/login', 'POST', { 
      username: 'test', 
      password: 'test' 
    });
    
    if (healthCheck.status === 401) {
      console.log('✅ Servidor responde correctamente');
    } else {
      console.log('⚠️ Servidor responde con status:', healthCheck.status);
    }
    
    // 2. Probar registro
    console.log('\n2️⃣ Probando registro de usuario...');
    const registerResponse = await makeRequest('/api/auth/register', 'POST', {
      dni: dni,
      nombre: 'Usuario',
      apellido: 'Prueba',
      funcion: 'Médico',
      email: email,
      username: username
    });
    
    console.log('Status:', registerResponse.status);
    console.log('Respuesta:', JSON.stringify(registerResponse.data, null, 2));
    
    if (registerResponse.data.success) {
      console.log('✅ Registro exitoso!');
      
      // 3. Probar login después del registro
      console.log('\n3️⃣ Probando login después del registro...');
      const loginResponse = await makeRequest('/api/auth/login', 'POST', { 
        username: username, 
        password: dni // La contraseña es el DNI
      });
      
      console.log('Status login:', loginResponse.status);
      console.log('Respuesta login:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data.success) {
        console.log('✅ Login exitoso después del registro!');
      } else {
        console.log('❌ Login falló después del registro');
        console.log('💡 Posible problema: Usuario no está activo o necesita confirmación');
      }
      
    } else {
      console.log('❌ Registro falló');
      console.log('💡 Error:', registerResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar prueba
testRegistro(); 