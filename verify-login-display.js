const https = require('https');

async function verifyLoginDisplay() {
  console.log('🔍 Verificando que el login se muestre correctamente...\n');
  
  const url = 'https://tablero-control-1.onrender.com';
  
  try {
    console.log('📄 Verificando página principal...');
    const response = await new Promise((resolve, reject) => {
      const req = https.request(url, (res) => {
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
    
    if (response.status === 200) {
      console.log('✅ Página principal responde correctamente');
      
      // Verificar que no contenga el alert molesto
      if (response.data.includes('JavaScript funciona desde HTML')) {
        console.log('❌ ERROR: El alert molesto aún está presente');
        console.log('💡 El despliegue aún no se ha completado o hay cache');
      } else {
        console.log('✅ El alert molesto ha sido eliminado');
      }
      
      // Verificar que contenga elementos del login
      if (response.data.includes('Iniciar Sesión') || response.data.includes('login-form')) {
        console.log('✅ Formulario de login detectado');
      } else {
        console.log('⚠️  No se detectó el formulario de login');
      }
      
      // Verificar que contenga el logo SDO
      if (response.data.includes('TABLERO S/D/O')) {
        console.log('✅ Logo SDO detectado');
      } else {
        console.log('⚠️  Logo SDO no detectado');
      }
      
    } else {
      console.log('❌ Error: Página no responde correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
  
  console.log('\n🎯 Recomendaciones:');
  console.log('1. Si el alert persiste, espera 2-3 minutos para que se complete el despliegue');
  console.log('2. Limpia el cache del navegador (Ctrl+F5)');
  console.log('3. Verifica que el login aparezca correctamente');
  console.log(`4. URL de la aplicación: ${url}`);
}

verifyLoginDisplay(); 