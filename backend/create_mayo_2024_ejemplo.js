const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Crear archivo Excel para mayo 2024 (como ejemplo del usuario: 01/05/24 - 31/05/24)
function crearMayo2024() {
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICO DE MOTIVOS DE EGRESOS'], // Título
    [], // Fila vacía
    ['Desde:', '01/05/24'], // Fecha desde - EXACTAMENTE como el usuario mencionó
    ['Hasta:', '31/05/24'], // Fecha hasta - EXACTAMENTE como el usuario mencionó
    [], // Fila vacía
    ['', '', 'RANKING DE DIAGNÓSTICOS - MAYO 2024'], // Subtítulo
    [], // Fila vacía
    ['#', 'Código', 'Diagnóstico', 'Cantidad'], // Headers
    [1, 'K59.0', 'Estreñimiento', 67], // Datos de ejemplo
    [2, 'I10', 'Hipertensión esencial', 54],
    [3, 'E11.9', 'Diabetes mellitus tipo 2 sin complicaciones', 41],
    [4, 'J18.9', 'Neumonía no especificada', 38]
  ];

  // Crear workbook y worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mayo 2024');

  // Crear directorio si no existe
  const outputDir = path.join(__dirname, 'test_files');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Guardar archivo
  const outputPath = path.join(outputDir, 'mayo_2024_ejemplo.xls');
  XLSX.writeFile(workbook, outputPath);

  console.log('📅 ARCHIVO CREADO: mayo_2024_ejemplo.xls');
  console.log('   📍 Desde: 01/05/24 (1 de mayo de 2024)');
  console.log('   📍 Hasta: 31/05/24 (31 de mayo de 2024)');
  console.log('   🎯 Debe detectar: AÑO = 2024, MES = MAYO');
  console.log('   📁 Ubicación:', outputPath);
  
  return outputPath;
}

// Crear también algunos archivos adicionales con fechas de 2024 para más pruebas
function crearArchivos2024Adicionales() {
  const archivos = [
    {
      nombre: 'enero_2024_ejemplo.xls',
      desde: '01/01/24',
      hasta: '31/01/24',
      mes: 'ENERO',
      datos: [
        [1, 'J44.1', 'EPOC con exacerbación aguda', 45],
        [2, 'I10', 'Hipertensión esencial', 38],
        [3, 'E11.9', 'Diabetes mellitus tipo 2', 32],
        [4, 'K59.0', 'Estreñimiento', 28]
      ]
    },
    {
      nombre: 'agosto_2024_ejemplo.xls',
      desde: '01/08/24',
      hasta: '31/08/24',
      mes: 'AGOSTO',
      datos: [
        [1, 'I10', 'Hipertensión esencial', 62],
        [2, 'J18.9', 'Neumonía no especificada', 48],
        [3, 'K59.0', 'Estreñimiento', 35],
        [4, 'E11.9', 'Diabetes mellitus tipo 2', 31]
      ]
    },
    {
      nombre: 'diciembre_2024_ejemplo.xls',
      desde: '01/12/24',
      hasta: '31/12/24',
      mes: 'DICIEMBRE',
      datos: [
        [1, 'J18.9', 'Neumonía no especificada', 78],
        [2, 'I10', 'Hipertensión esencial', 65],
        [3, 'J44.1', 'EPOC con exacerbación aguda', 52],
        [4, 'K59.0', 'Estreñimiento', 47]
      ]
    }
  ];

  archivos.forEach(archivo => {
    const data = [
      ['HOSPITAL RANKING DE DIAGNÓSTICO DE MOTIVOS DE EGRESOS'],
      [],
      ['Desde:', archivo.desde],
      ['Hasta:', archivo.hasta],
      [],
      ['', '', `RANKING DE DIAGNÓSTICOS - ${archivo.mes} 2024`],
      [],
      ['#', 'Código', 'Diagnóstico', 'Cantidad'],
      ...archivo.datos
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, `${archivo.mes} 2024`);

    const outputDir = path.join(__dirname, 'test_files');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, archivo.nombre);
    XLSX.writeFile(workbook, outputPath);

    console.log(`📅 ${archivo.nombre}`);
    console.log(`   📍 ${archivo.desde} - ${archivo.hasta} → ${archivo.mes} 2024`);
  });
}

console.log('🚀 Creando archivos Excel de ejemplo para 2024...\n');

// Crear el archivo específico de mayo 2024 que mencionó el usuario
crearMayo2024();

console.log('');

// Crear archivos adicionales para más pruebas
crearArchivos2024Adicionales();

console.log('\n✅ ¡Archivos de ejemplo creados correctamente!');
console.log('\n📋 Cómo probar el sistema:');
console.log('1. Ve a Ranking Diagnóstico en la aplicación');
console.log('2. Selecciona cualquier establecimiento y categoría');
console.log('3. Sube el archivo "mayo_2024_ejemplo.xls"');
console.log('4. Observa cómo detecta automáticamente:');
console.log('   • AÑO: 2024 (de las fechas 01/05/24 - 31/05/24)');
console.log('   • MES: MAYO (porque es mayo)');
console.log('5. El archivo se guardará en la carpeta correcta: .../2024/');
console.log('');
console.log('🎯 ¡El sistema ahora detecta automáticamente año Y mes!');
console.log('📁 Archivos en: backend/test_files/'); 