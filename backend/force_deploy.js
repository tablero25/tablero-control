// Script para forzar el redeploy y verificar el endpoint
const https = require('https');

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'tablero-control-1.onrender.com',
      port: 443,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/Reset-Script'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('🔍 Probando endpoints...');
  
  try {
    // Probar endpoint de login primero
    console.log('1. Probando endpoint de login...');
    const loginTest = await makeRequest('/api/auth/login', 'POST', {
      username: 'test',
      password: 'test'
    });
    console.log(`   Status: ${loginTest.status}`);
    
    // Probar endpoint de reset-users
    console.log('2. Probando endpoint de reset-users...');
    const resetTest = await makeRequest('/api/reset-users', 'POST');
    console.log(`   Status: ${resetTest.status}`);
    console.log(`   Response:`, resetTest.data);
    
    if (resetTest.status === 200) {
      console.log('✅ Endpoint /api/reset-users está funcionando!');
      console.log('🎉 Puedes usar el botón en la aplicación para resetear usuarios.');
    } else if (resetTest.status === 404) {
      console.log('❌ Endpoint no encontrado. Render necesita redeploy.');
      console.log('💡 Ve a tu panel de Render y haz "Manual Deploy"');
    } else {
      console.log(`⚠️ Endpoint responde con status ${resetTest.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error conectando al servidor:', error.message);
    console.log('💡 El servidor puede estar caído o no disponible.');
  }
}

// Ejecutar las pruebas
testEndpoints(); 