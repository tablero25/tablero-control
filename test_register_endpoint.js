const https = require('https');

async function testRegisterEndpoint() {
  console.log('🔍 Probando endpoint de registro...');
  
  const postData = JSON.stringify({
    username: 'test_user',
    email: 'test@example.com',
    password: 'test123',
    dni: '12345678',
    nombre: 'Test',
    apellido: 'User',
    funcion: 'Test Function'
  });

  const options = {
    hostname: 'tablero-control-1.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response:', data);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// También probar la ruta de login
async function testLoginEndpoint() {
  console.log('\n🔍 Probando endpoint de login...');
  
  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const options = {
    hostname: 'tablero-control-1.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response:', data);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    await testRegisterEndpoint();
    await testLoginEndpoint();
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

runTests(); 