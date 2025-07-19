const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Desplegando frontend inmediatamente...');

try {
  // 1. Construir el frontend
  console.log('📦 Construyendo frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  // 2. Verificar que el build existe
  const buildPath = path.join(__dirname, 'frontend', 'build');
  if (!fs.existsSync(buildPath)) {
    throw new Error('❌ El build del frontend no se creó correctamente');
  }
  
  // 3. Copiar al backend
  console.log('📁 Copiando build al backend...');
  const backendBuildPath = path.join(__dirname, 'backend', 'build');
  
  // Eliminar build anterior si existe
  if (fs.existsSync(backendBuildPath)) {
    fs.rmSync(backendBuildPath, { recursive: true, force: true });
  }
  
  // Copiar nuevo build
  fs.cpSync(buildPath, backendBuildPath, { recursive: true });
  
  console.log('✅ Frontend copiado al backend exitosamente!');
  console.log('📊 Estructura final:');
  console.log(`   - Frontend build: ${buildPath}`);
  console.log(`   - Backend build: ${backendBuildPath}`);
  
  // 4. Hacer commit y push
  console.log('🔄 Haciendo commit y push...');
  execSync('git add backend/build', { stdio: 'inherit' });
  execSync('git commit -m "Frontend build agregado"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('🎉 ¡Frontend desplegado exitosamente!');
  console.log('⏱️ Espera 2-3 minutos para que Render actualice el sitio');
  console.log('🌐 URL: https://tablero-control-1.onrender.com');
  
} catch (error) {
  console.error('❌ Error durante el despliegue:', error.message);
  process.exit(1);
} 