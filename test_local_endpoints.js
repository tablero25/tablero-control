const http = require('http');

async function testLocalEndpoint(path, method = 'GET', data = null) {
  console.log(`🔍 Probando ${method} ${path} en servidor local...`);
  
  const postData = data ? JSON.stringify(data) : null;
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (postData) {
    options.headers['Content-Length'] = Buffer.byteLength(postData);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response:', responseData.substring(0, 200) + '...');
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
    console.log('🧪 Probando servidor local...\n');
    
    // Probar rutas que deberían funcionar
    await testLocalEndpoint('/api/health');
    console.log('');
    
    await testLocalEndpoint('/api/test');
    console.log('');
    
    // Probar rutas de autenticación
    await testLocalEndpoint('/api/auth/register', 'POST', {
      username: 'test_user',
      email: 'test@example.com',
      password: 'test123',
      dni: '12345678',
      nombre: 'Test',
      apellido: 'User',
      funcion: 'Test Function'
    });
    console.log('');
    
    await testLocalEndpoint('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('');
    
    // Probar rutas que deberían fallar
    await testLocalEndpoint('/api/nonexistent');
    console.log('');
    
    await testLocalEndpoint('/nonexistent', 'POST', { test: 'data' });
    console.log('');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Esperar un momento para que el servidor se inicie
setTimeout(runTests, 2000); 