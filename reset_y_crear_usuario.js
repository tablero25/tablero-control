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

async function resetYCrearUsuario() {
  console.log('🔄 RESETEANDO Y CREANDO USUARIO\n');
  
  try {
    // 1. Usar el endpoint de reset
    console.log('1️⃣ Llamando al endpoint de reset...');
    const resetResponse = await makeRequest('/api/auth/reset-users', 'POST');
    
    console.log('Status:', resetResponse.status);
    console.log('Respuesta:', JSON.stringify(resetResponse.data, null, 2));
    
    if (resetResponse.data.success) {
      console.log('✅ Usuario creado exitosamente!');
      console.log('');
      console.log('🔑 DATOS DE ACCESO:');
      console.log('   Usuario: 123');
      console.log('   Contraseña: 123');
      console.log('');
      console.log('🌐 Puedes hacer login en:');
      console.log('   https://tablero-control-1.onrender.com/login');
    } else {
      console.log('❌ Error en el reset');
      console.log('💡 Error:', resetResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('');
    console.log('💡 SOLUCIÓN ALTERNATIVA:');
    console.log('1. Ve a https://tablero-control-1.onrender.com');
    console.log('2. Haz clic en "Resetear Todos los Usuarios"');
    console.log('3. Usa los datos: Usuario: 123, Contraseña: 123');
  }
}

resetYCrearUsuario(); 