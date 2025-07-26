const https = require('https');

async function testStaticFiles() {
  console.log('🔍 VERIFICANDO ARCHIVOS ESTÁTICOS DESDE RUTAS ANIDADAS\n');
  
  const baseUrl = 'https://tablero-control-1.onrender.com';
  const testRoutes = [
    '/',
    '/sistema-tablero/configuracion/usuarios',
    '/sistema-tablero/configuracion',
    '/login'
  ];
  
  const staticFiles = [
    '/static/css/main.26de61f2.css',
    '/static/js/main.ac5d4d66.js',
    '/manifest.json',
    '/favicon.ico'
  ];
  
  console.log('📄 Probando rutas principales...');
  for (const route of testRoutes) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(`${baseUrl}${route}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cache-Control': 'no-cache'
          }
        }, (res) => {
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

        req.end();
      });

      console.log(`✅ ${route}: ${response.status} OK`);
      
      // Verificar si el HTML contiene referencias a archivos estáticos
      const hasMainJS = response.data.includes('main.ac5d4d66.js');
      const hasMainCSS = response.data.includes('main.26de61f2.css');
      
      if (hasMainJS && hasMainCSS) {
        console.log(`   📦 Archivos estáticos referenciados correctamente`);
      } else {
        console.log(`   ⚠️  Archivos estáticos no encontrados en HTML`);
      }
      
    } catch (error) {
      console.log(`❌ ${route}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📦 Probando archivos estáticos directamente...');
  for (const file of staticFiles) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(`${baseUrl}${file}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cache-Control': 'no-cache'
          }
        }, (res) => {
          resolve({ 
            status: res.statusCode, 
            headers: res.headers
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.end();
      });

      if (response.status === 200) {
        console.log(`✅ ${file}: 200 OK`);
      } else {
        console.log(`❌ ${file}: ${response.status} ERROR`);
      }
      
    } catch (error) {
      console.log(`❌ ${file}: Error - ${error.message}`);
    }
  }
  
  console.log('\n🎯 RESUMEN:');
  console.log('1. Si las rutas principales responden 200, el routing funciona');
  console.log('2. Si los archivos estáticos responden 200, se sirven correctamente');
  console.log('3. Si hay errores 404, el problema está en la configuración del servidor');
  console.log(`4. URL base: ${baseUrl}`);
}

testStaticFiles(); 