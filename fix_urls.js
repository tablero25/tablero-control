const fs = require('fs');
const path = require('path');

// Función para reemplazar URLs en un archivo
function replaceUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Reemplazar todas las URLs de localhost
    content = content.replace(/http:\/\/localhost:5001/g, 'https://tablero-control-1.onrender.com');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      replaceUrlsInFile(filePath);
    }
  });
}

console.log('🔧 Reemplazando URLs de localhost con URL de producción...');

// Procesar frontend
console.log('\n📁 Procesando frontend...');
processDirectory('./frontend');

// Procesar backend (solo archivos de test)
console.log('\n📁 Procesando backend...');
const backendFiles = [
  './backend/test_email_unique.js',
  './backend/test_email_simple.js',
  './backend/test_email_confirmation.js'
];

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    replaceUrlsInFile(file);
  }
});

console.log('\n✅ Proceso completado!'); 