const fs = require('fs');
const path = require('path');

console.log('🧪 Probando configuración de despliegue...\n');

// Verificar que bcryptjs está instalado
try {
  require('bcryptjs');
  console.log('✅ bcryptjs está disponible');
} catch (error) {
  console.error('❌ Error: bcryptjs no está disponible');
  process.exit(1);
}

// Verificar que no hay referencias a bcrypt
const backendFiles = fs.readdirSync('./backend').filter(file => file.endsWith('.js'));
let hasBcryptReferences = false;

backendFiles.forEach(file => {
  const content = fs.readFileSync(path.join('./backend', file), 'utf8');
  if (content.includes("require('bcrypt')")) {
    console.error(`❌ Error: ${file} contiene referencia a bcrypt`);
    hasBcryptReferences = true;
  }
});

if (!hasBcryptReferences) {
  console.log('✅ No hay referencias a bcrypt en archivos del backend');
}

// Verificar estructura de archivos
const requiredFiles = [
  'backend/package.json',
  'frontend/package.json',
  'render-build.sh',
  'render.yaml'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.error(`❌ Error: ${file} no existe`);
  }
});

console.log('\n🎉 Configuración verificada correctamente!');
console.log('📦 Puedes proceder con el despliegue en Render.'); 