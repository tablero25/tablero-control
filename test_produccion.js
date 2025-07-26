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

async function testProduccion() {
  console.log('🔍 PROBANDO SERVIDOR DE PRODUCCIÓN\n');
  
  try {
    // 1. Probar health check
    console.log('1️⃣ Probando health check...');
    const health = await makeRequest('/health', 'GET');
    console.log('Health Status:', health.status);
    console.log('Health Response:', health.data);
    
    // 2. Probar ruta de prueba
    console.log('\n2️⃣ Probando ruta de prueba...');
    const test = await makeRequest('/api/test', 'GET');
    console.log('Test Status:', test.status);
    console.log('Test Response:', test.data);
    
    // 3. Probar ruta de autenticación
    console.log('\n3️⃣ Probando ruta de autenticación...');
    const auth = await makeRequest('/api/auth/test', 'GET');
    console.log('Auth Status:', auth.status);
    console.log('Auth Response:', auth.data);
    
    // 4. Probar login
    console.log('\n4️⃣ Probando login...');
    const login = await makeRequest('/api/auth/login', 'POST', {
      username: 'test',
      password: 'test'
    });
    console.log('Login Status:', login.status);
    console.log('Login Response:', login.data);
    
    // 5. Probar registro
    console.log('\n5️⃣ Probando registro...');
    const timestamp = Date.now();
    const dni = `TEST${timestamp.toString().slice(-6)}`;
    const email = `test${timestamp}@sdo.gob.ar`;
    const username = dni;
    
    const register = await makeRequest('/api/auth/register', 'POST', {
      dni: dni,
      nombre: 'Usuario',
      apellido: 'Prueba',
      funcion: 'Médico',
      email: email,
      username: username
    });
    console.log('Register Status:', register.status);
    console.log('Register Response:', register.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProduccion(); 