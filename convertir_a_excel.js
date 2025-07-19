const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Función para convertir archivo .txt a .xlsx
function convertirTxtAExcel(txtPath, xlsxPath) {
  try {
    // Leer archivo .txt
    const contenido = fs.readFileSync(txtPath, 'utf8');
    
    // Dividir por líneas y filtrar líneas vacías
    const lineas = contenido.split(/\r?\n/).filter(l => l.trim().length > 0);
    
    if (lineas.length === 0) {
      console.log(`❌ Archivo vacío: ${txtPath}`);
      return false;
    }
    
    // Detectar delimitador (tabulador o espacios múltiples)
    let delimiter;
    if (contenido.includes('\t')) {
      delimiter = '\t';
    } else {
      delimiter = /\s+/;
    }
    
    // Procesar datos
    const datos = lineas.map(linea => {
      return linea.split(delimiter).map(celda => celda.trim());
    });
    
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(datos);
    
    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    
    // Escribir archivo Excel
    XLSX.writeFile(workbook, xlsxPath);
    
    console.log(`✅ Convertido: ${txtPath} → ${xlsxPath}`);
    return true;
  } catch (error) {
    console.log(`❌ Error convirtiendo ${txtPath}: ${error.message}`);
    return false;
  }
}

// Función para procesar todos los archivos en una carpeta
function procesarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta)) {
    console.log(`❌ Carpeta no existe: ${carpeta}`);
    return;
  }
  
  const archivos = fs.readdirSync(carpeta);
  let convertidos = 0;
  let errores = 0;
  
  archivos.forEach(archivo => {
    if (archivo.endsWith('.txt')) {
      const txtPath = path.join(carpeta, archivo);
      const xlsxPath = path.join(carpeta, archivo.replace('.txt', '.xlsx'));
      
      if (convertirTxtAExcel(txtPath, xlsxPath)) {
        convertidos++;
      } else {
        errores++;
      }
    }
  });
  
  console.log(`\n📊 Resumen: ${convertidos} convertidos, ${errores} errores`);
}

// Procesar todas las carpetas de datos
function procesarTodasLasCarpetas() {
  const dataDir = path.join(__dirname, 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.log('❌ No existe la carpeta data/');
    return;
  }
  
  const establecimientos = fs.readdirSync(dataDir).filter(f => 
    fs.statSync(path.join(dataDir, f)).isDirectory()
  );
  
  console.log('🚀 Iniciando conversión de archivos .txt a .xlsx...\n');
  
  establecimientos.forEach(establecimiento => {
    const estDir = path.join(dataDir, establecimiento);
    const anios = fs.readdirSync(estDir).filter(f => 
      fs.statSync(path.join(estDir, f)).isDirectory()
    );
    
    anios.forEach(anio => {
      const anioDir = path.join(estDir, anio);
      console.log(`\n📁 Procesando: ${establecimiento}/${anio}/`);
      procesarCarpeta(anioDir);
    });
  });
  
  console.log('\n✅ Conversión completada!');
}

// Ejecutar conversión
procesarTodasLasCarpetas(); 