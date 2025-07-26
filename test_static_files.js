const https = require('https');

async function testStaticFiles() {
  console.log('🔍 Probando archivos estáticos...\n');
  
  const files = [
    '/static/js/main.91c63652.js',
    '/static/css/main.f425e3f6.css',
    '/favicon.ico',
    '/manifest.json'
  ];

  for (const file of files) {
    console.log(`🧪 Probando ${file}...`);
    
    const options = {
      hostname: 'tablero-control-1.onrender.com',
      port: 443,
      path: file,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

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
              headers: res.headers
            });
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.end();
      });

      console.log(`📊 Status: ${result.status}`);
      console.log(`📋 Content-Type: ${result.headers['content-type']}`);
      
      if (result.status === 200) {
        console.log('✅ ÉXITO: Archivo encontrado');
      } else if (result.status === 404) {
        console.log('❌ ERROR: Archivo no encontrado');
      } else {
        console.log(`⚠️  ADVERTENCIA: Status inesperado ${result.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Error probando ${file}:`, error.message);
    }
    
    console.log('');
  }
}

testStaticFiles(); 