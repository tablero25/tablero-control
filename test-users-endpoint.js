const https = require('https');

async function testUsersEndpoint() {
  console.log('🔍 PROBANDO ENDPOINT DE USUARIOS\n');
  
  const baseUrl = 'https://tablero-control-1.onrender.com';
  
  try {
    // Primero hacer login para obtener token
    console.log('1️⃣ Haciendo login para obtener token...');
    const loginResponse = await new Promise((resolve, reject) => {
      const req = https.request(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({ 
            status: res.statusCode, 
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(JSON.stringify({
        username: '35477889',
        password: '123456'
      }));
      req.end();
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginResponse.status);
      return;
    }

    const loginData = JSON.parse(loginResponse.data);
    if (!loginData.success || !loginData.token) {
      console.log('❌ Login fallido:', loginData);
      return;
    }

    console.log('✅ Login exitoso');
    console.log('👤 Usuario:', loginData.user.username);
    console.log('🔑 Token:', loginData.token.substring(0, 50) + '...');

    // Ahora probar el endpoint de usuarios
    console.log('\n2️⃣ Probando endpoint /api/users...');
    const usersResponse = await new Promise((resolve, reject) => {
      const req = https.request(`${baseUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({ 
            status: res.statusCode, 
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });

    console.log(`📊 Status: ${usersResponse.status}`);
    
    if (usersResponse.status === 200) {
      const usersData = JSON.parse(usersResponse.data);
      console.log('✅ Endpoint responde correctamente');
      
      console.log('\n📋 Estructura de respuesta:');
      console.log('- success:', usersData.success);
      console.log('- total:', usersData.total);
      console.log('- confirmed:', usersData.confirmed);
      console.log('- pending:', usersData.pending);
      
      if (usersData.users) {
        console.log(`\n👥 Usuarios confirmados (${usersData.users.length}):`);
        usersData.users.forEach(user => {
          console.log(`  - ${user.username} (${user.email}) - ${user.role} - ${user.is_active ? 'Activo' : 'Bloqueado'}`);
        });
      }
      
      if (usersData.pendingUsers) {
        console.log(`\n⏳ Usuarios pendientes (${usersData.pendingUsers.length}):`);
        usersData.pendingUsers.forEach(user => {
          console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
        });
      }
      
    } else {
      console.log('❌ Error en endpoint de usuarios:', usersResponse.status);
      console.log('Respuesta:', usersResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
  
  console.log('\n🎯 RESUMEN:');
  console.log('1. Si el login funciona, la autenticación está correcta');
  console.log('2. Si el endpoint responde 200, la autorización está correcta');
  console.log('3. Si la estructura es correcta, el frontend podrá cargar usuarios');
  console.log(`4. URL base: ${baseUrl}`);
}

testUsersEndpoint(); 