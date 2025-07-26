const https = require('https');

async function diagnoseDeployment() {
  console.log('🔍 DIAGNÓSTICO DETALLADO DEL DESPLIEGUE\n');
  
  const url = 'https://tablero-control-1.onrender.com';
  
  try {
    console.log('📄 Verificando página principal...');
    const response = await new Promise((resolve, reject) => {
      const req = https.request(url, {
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

    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers['content-type']}`);
    console.log(`📏 Tamaño: ${response.data.length} bytes`);
    
    if (response.status === 200) {
      console.log('✅ Página principal responde correctamente');
      
      // Verificar contenido específico
      const hasAlert = response.data.includes('JavaScript funciona desde HTML');
      const hasLoginForm = response.data.includes('Iniciar Sesión') || response.data.includes('login-form');
      const hasLogoSDO = response.data.includes('TABLERO S/D/O');
      const hasReactRoot = response.data.includes('id="root"');
      const hasMainJS = response.data.includes('main.ac5d4d66.js');
      
      console.log('\n🔍 Análisis del contenido:');
      console.log(`- Alert molesto: ${hasAlert ? '❌ PRESENTE' : '✅ ELIMINADO'}`);
      console.log(`- Formulario login: ${hasLoginForm ? '✅ DETECTADO' : '❌ NO DETECTADO'}`);
      console.log(`- Logo SDO: ${hasLogoSDO ? '✅ DETECTADO' : '❌ NO DETECTADO'}`);
      console.log(`- React root: ${hasReactRoot ? '✅ DETECTADO' : '❌ NO DETECTADO'}`);
      console.log(`- Main JS: ${hasMainJS ? '✅ DETECTADO' : '❌ NO DETECTADO'}`);
      
      // Mostrar las primeras líneas del HTML
      console.log('\n📄 Primeras líneas del HTML:');
      const lines = response.data.split('\n').slice(0, 5);
      lines.forEach((line, i) => {
        console.log(`${i + 1}: ${line.substring(0, 100)}...`);
      });
      
      // Verificar si es el HTML correcto
      if (response.data.includes('<!doctype html>') && response.data.includes('main.ac5d4d66.js')) {
        console.log('\n✅ El HTML parece ser el correcto del build de React');
      } else {
        console.log('\n❌ El HTML no parece ser el correcto del build de React');
      }
      
    } else {
      console.log('❌ Error: Página no responde correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETO');
  console.log('1. Si el alert persiste, el problema es de cache del servidor');
  console.log('2. Si no hay formulario de login, el problema es de rutas');
  console.log('3. Si el HTML es correcto pero no funciona, es problema de JavaScript');
  console.log(`4. URL de la aplicación: ${url}`);
}

diagnoseDeployment(); 