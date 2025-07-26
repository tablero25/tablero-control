const https = require('https');

async function testExactAuth() {
  console.log('🔍 Probando rutas de autenticación específicas...\n');
  
  const tests = [
    {
      name: 'GET /api/auth/test',
      method: 'GET',
      path: '/api/auth/test'
    },
    {
      name: 'POST /api/auth/register',
      method: 'POST',
      path: '/api/auth/register',
      data: {
        username: 'test',
        email: 'test@test.com',
        dni: '12345678',
        nombre: 'Test',
        apellido: 'User',
        funcion: 'Test'
      }
    },
    {
      name: 'POST /api/auth/login',
      method: 'POST',
      path: '/api/auth/login',
      data: {
        username: 'admin',
        password: 'admin123'
      }
    }
  ];

  for (const test of tests) {
    console.log(`🧪 ${test.name}...`);
    
    const postData = test.data ? JSON.stringify(test.data) : null;
    
    const options = {
      hostname: 'tablero-control-1.onrender.com',
      port: 443,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            resolve({ 
              status: res.statusCode, 
              data: data,
              headers: res.headers
            });
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        if (postData) {
          req.write(postData);
        }
        req.end();
      });

      console.log(`📊 Status: ${result.status}`);
      console.log(`📋 Content-Type: ${result.headers['content-type']}`);
      console.log(`📄 Response: ${result.data}`);
      
      if (result.status === 200) {
        console.log('✅ ÉXITO: Ruta funcionando correctamente');
      } else if (result.status === 404) {
        console.log('❌ ERROR: Ruta no encontrada');
      } else {
        console.log(`⚠️  ADVERTENCIA: Status inesperado ${result.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Error en ${test.name}:`, error.message);
    }
    
    console.log('');
  }
}

testExactAuth(); 