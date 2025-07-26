const https = require('https');

async function testPath(path) {
  console.log(`🔍 Probando ruta: ${path}`);
  
  const options = {
    hostname: 'tablero-control-1.onrender.com',
    port: 443,
    path: path,
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
        console.log('📄 Response:', data.substring(0, 200) + '...');
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
    console.log('🧪 Probando diferentes rutas para diagnosticar el problema...\n');
    
    await testPath('/api/health');
    console.log('');
    
    await testPath('/api/test');
    console.log('');
    
    await testPath('/api/auth/test');
    console.log('');
    
    await testPath('/api/auth/register');
    console.log('');
    
    await testPath('/api/auth/login');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

runTests(); 