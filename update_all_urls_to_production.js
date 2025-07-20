const fs = require('fs');
const path = require('path');

// Configuración
const OLD_URL = 'https://tablero-control-1.onrender.com';
const NEW_URL = 'https://tablero-control-1.onrender.com';

// Extensiones de archivos a procesar
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css'];

// Directorios a excluir
const EXCLUDE_DIRS = ['node_modules', '.git', 'BACKUP_FINAL_COMPLETO', 'build', 'dist'];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSIONS.includes(ext);
}

function shouldProcessDirectory(dirPath) {
  const dirName = path.basename(dirPath);
  return !EXCLUDE_DIRS.includes(dirName);
}

function processFile(filePath) {
  try {
    console.log(`📝 Procesando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Reemplazar URLs
    content = content.replace(new RegExp(OLD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_URL);
    
    // Si el contenido cambió, escribir el archivo
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      return 1;
    } else {
      console.log(`⏭️  Sin cambios: ${filePath}`);
      return 0;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  let totalFiles = 0;
  let updatedFiles = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (shouldProcessDirectory(fullPath)) {
          const [files, updated] = processDirectory(fullPath);
          totalFiles += files;
          updatedFiles += updated;
        }
      } else if (stat.isFile()) {
        if (shouldProcessFile(fullPath)) {
          totalFiles++;
          updatedFiles += processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error procesando directorio ${dirPath}:`, error.message);
  }
  
  return [totalFiles, updatedFiles];
}

// Función principal
function main() {
  console.log('🚀 Iniciando actualización de URLs a producción...');
  console.log(`🔄 Cambiando: ${OLD_URL} → ${NEW_URL}`);
  console.log('');
  
  const startTime = Date.now();
  const [totalFiles, updatedFiles] = processDirectory('.');
  const endTime = Date.now();
  
  console.log('');
  console.log('📊 RESUMEN:');
  console.log(`   Archivos procesados: ${totalFiles}`);
  console.log(`   Archivos actualizados: ${updatedFiles}`);
  console.log(`   Tiempo total: ${endTime - startTime}ms`);
  console.log('');
  console.log('✅ ¡Actualización completada!');
  console.log('');
  console.log('🎯 URLs actualizadas en:');
  console.log('   - Frontend (React)');
  console.log('   - Backend (Node.js)');
  console.log('   - Archivos de configuración');
  console.log('');
  console.log('🌐 Sistema listo para producción en:');
  console.log(`   ${NEW_URL}`);
}

// Ejecutar
main(); 