// Using built-in fetch (available in Node.js 18+)

const API_URL = 'https://tablero-control-1.onrender.com';

async function testUserManagement() {
  console.log('🧪 Probando endpoints de gestión de usuarios...\n');

  // 1. Primero hacer login para obtener token
  console.log('1️⃣ Haciendo login...');
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('📋 Respuesta login:', loginData);

    if (!loginData.success) {
      console.log('❌ Login falló, probando con datos básicos...');
      // Usar token temporal para pruebas
      const token = 'test_token';
      
      // 2. Probar endpoint de usuarios
      console.log('\n2️⃣ Probando GET /api/users...');
      const usersResponse = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📋 Status:', usersResponse.status);
      const usersData = await usersResponse.text();
      console.log('📋 Respuesta:', usersData.substring(0, 200));
    } else {
      const token = loginData.token;
      console.log('✅ Login exitoso, token obtenido');

      // 2. Probar endpoint de usuarios
      console.log('\n2️⃣ Probando GET /api/users...');
      const usersResponse = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📋 Status:', usersResponse.status);
      const usersData = await usersResponse.json();
      console.log('📋 Usuarios encontrados:', usersData.length || 0);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }

  // 3. Probar favicon
  console.log('\n3️⃣ Probando favicon...');
  try {
    const faviconResponse = await fetch(`${API_URL}/favicon.ico`);
    console.log('📋 Favicon status:', faviconResponse.status);
    
    const configFaviconResponse = await fetch(`${API_URL}/sistema-tablero/configuracion/favicon.ico`);
    console.log('📋 Config favicon status:', configFaviconResponse.status);
  } catch (error) {
    console.error('❌ Error probando favicon:', error.message);
  }

  console.log('\n✅ Test completado');
}

testUserManagement(); 