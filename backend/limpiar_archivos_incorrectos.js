const fs = require('fs');
const path = require('path');

console.log('🧹 Herramienta de limpieza de archivos incorrectos\n');

function limpiarDirectorio(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`❌ No existe: ${dirPath}`);
    return;
  }
  
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Eliminado: ${dirPath}`);
  } catch (error) {
    console.log(`❌ Error al eliminar ${dirPath}: ${error.message}`);
  }
}

function limpiarArchivosIncorrectos() {
  console.log('🔍 Buscando archivos subidos incorrectamente...\n');
  
  const basePath = path.join(__dirname, 'data');
  
  // Rutas de archivos que podrían haberse subido incorrectamente
  const rutasALimpiar = [
    path.join(basePath, '25 San Carlos', 'Ranking de mortalidad'),
    path.join(basePath, '25 San Carlos', 'Ranking por diagnóstico de atención'),
    path.join(basePath, '25 San Carlos', 'Ranking de diagnóstico de emergencia'),
    path.join(basePath, '28 Gral. Enrique Mosconi', 'Ranking de mortalidad'),
    path.join(basePath, '10 Nazareno', 'Ranking de mortalidad'),
  ];
  
  let archivosEliminados = 0;
  
  rutasALimpiar.forEach(ruta => {
    if (fs.existsSync(ruta)) {
      // Verificar si tiene archivos
      const archivos = fs.readdirSync(ruta, { withFileTypes: true });
      if (archivos.length > 0) {
        console.log(`🧹 Limpiando directorio: ${ruta}`);
        archivos.forEach(archivo => {
          if (archivo.isFile()) {
            console.log(`   📄 Eliminar archivo: ${archivo.name}`);
            archivosEliminados++;
          } else if (archivo.isDirectory()) {
            console.log(`   📁 Eliminar directorio: ${archivo.name}`);
          }
        });
        
        limpiarDirectorio(ruta);
      } else {
        console.log(`📂 Directorio vacío: ${ruta}`);
        limpiarDirectorio(ruta);
      }
    }
  });
  
  console.log(`\n🎯 Limpieza completada: ${archivosEliminados} archivos eliminados`);
}

function mostrarEstructuraLimpia() {
  console.log('\n📋 Estructura de directorios después de la limpieza:');
  
  const basePath = path.join(__dirname, 'data');
  
  if (!fs.existsSync(basePath)) {
    console.log('❌ No existe el directorio de datos');
    return;
  }
  
  const establecimientos = fs.readdirSync(basePath, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  establecimientos.forEach(establecimiento => {
    console.log(`\n📍 ${establecimiento}:`);
    
    const establPath = path.join(basePath, establecimiento);
    const categorias = fs.readdirSync(establPath, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name);
    
    categorias.forEach(categoria => {
      const categPath = path.join(establPath, categoria);
      const años = fs.readdirSync(categPath, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name);
      
      console.log(`   📊 ${categoria}:`);
      años.forEach(año => {
        const añoPath = path.join(categPath, año);
        const archivos = fs.readdirSync(añoPath, { withFileTypes: true });
        console.log(`     📅 ${año}: ${archivos.length} archivos/carpetas`);
      });
    });
  });
}

// Ejecutar limpieza
limpiarArchivosIncorrectos();
mostrarEstructuraLimpia();

console.log('\n✅ Limpieza completada!');
console.log('💡 Ahora todos los archivos deben estar en las categorías correctas');
console.log('🔒 La validación evitará futuros archivos incorrectos'); 