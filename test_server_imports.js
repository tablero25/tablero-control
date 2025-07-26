const https = require('https');

async function testServerImports() {
  console.log('🔍 Probando si el servidor puede importar dependencias...');
  
  const options = {
    hostname: 'tablero-control-1.onrender.com',
    port: 443,
    path: '/api/test',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
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

    req.end();
  });
}

async function testHealthEndpoint() {
  console.log('\n🔍 Probando endpoint de salud...');
  
  const options = {
    hostname: 'tablero-control-1.onrender.com',
    port: 443,
    path: '/api/health',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
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

    req.end();
  });
}

async function runTests() {
  try {
    await testServerImports();
    await testHealthEndpoint();
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

runTests(); 