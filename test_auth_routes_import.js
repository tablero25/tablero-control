const path = require('path');

console.log('🔍 Probando importación de authRoutes.js...');

try {
  // Cambiar al directorio backend
  const backendPath = path.join(__dirname, 'backend');
  process.chdir(backendPath);
  console.log('📁 Directorio actual:', process.cwd());
  
  // Intentar importar authRoutes
  const authRoutes = require(path.join(backendPath, 'authRoutes'));
  
  console.log('✅ authRoutes.js se importó correctamente');
  console.log('📋 Rutas disponibles:', authRoutes.stack ? authRoutes.stack.length : 'No se puede determinar');
  
  // Verificar si es un router de Express
  if (typeof authRoutes === 'function') {
    console.log('✅ Es una función (router de Express)');
  } else {
    console.log('❌ No es una función');
  }
  
} catch (error) {
  console.error('❌ Error al importar authRoutes.js:', error.message);
  console.error('📋 Stack trace:', error.stack);
} 