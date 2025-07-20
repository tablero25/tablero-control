const fs = require('fs');
const path = require('path');

// Función para reemplazar URLs en un archivo
function replaceUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Reemplazar todas las URLs de localhost con la URL de producción
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
    
    if (stat.isDirectory()) {
      // Procesar subdirectorios
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      // Procesar archivos JavaScript
      replaceUrlsInFile(filePath);
    }
  });
}

console.log('🔧 Iniciando reemplazo de URLs para producción...');

// Procesar el directorio frontend/src
const frontendSrcPath = path.join(__dirname, 'frontend', 'src');
if (fs.existsSync(frontendSrcPath)) {
  processDirectory(frontendSrcPath);
  console.log('✅ Procesamiento completado');
} else {
  console.log('❌ Directorio frontend/src no encontrado');
} 