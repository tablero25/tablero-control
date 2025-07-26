const https = require('https');

async function testAuthRoute(path, method = 'GET', data = null) {
  console.log(`🔍 Probando ${method} ${path}...`);
  
  const postData = data ? JSON.stringify(data) : null;
  
  const options = {
    hostname: 'tablero-control-1.onrender.com',
    port: 443,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  if (postData) {
    options.headers['Content-Length'] = Buffer.byteLength(postData);
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Content-Type: ${res.headers['content-type']}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🧪 Probando rutas de autenticación...\n');
    
    // Probar ruta de prueba de auth
    await testAuthRoute('/api/auth/test');
    console.log('');
    
    // Probar registro con datos mínimos
    await testAuthRoute('/api/auth/register', 'POST', {
      username: 'test',
      email: 'test@test.com',
      dni: '12345678',
      nombre: 'Test',
      apellido: 'User',
      funcion: 'Test'
    });
    console.log('');
    
    // Probar login
    await testAuthRoute('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

runTests(); 