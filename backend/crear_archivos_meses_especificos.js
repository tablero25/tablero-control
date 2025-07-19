const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('🎯 Creando archivos Excel específicos por mes para probar filtrado...\n');

// Función para crear archivo específico por mes
function crearArchivoPorMes(mes, fechaDesde, fechaHasta, nombreArchivo, datos) {
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICO DE MOTIVOS DE EGRESOS'],
    [],
    ['Desde:', fechaDesde], // Fecha específica del mes
    ['Hasta:', fechaHasta],  // Fecha específica del mes
    [],
    [`RANKING DE DIAGNÓSTICOS - ${mes} 2024`],
    [],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    ...datos
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, `${mes} 2024`);

  const outputDir = path.join(__dirname, 'test_files');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, nombreArchivo);
  XLSX.writeFile(workbook, outputPath);

  console.log(`✅ ${nombreArchivo}`);
  console.log(`   📅 ${fechaDesde} - ${fechaHasta} → ${mes}`);
  
  return outputPath;
}

// Crear archivos para diferentes meses con nombres específicos
const archivos = [
  {
    mes: 'FEBRERO',
    fechaDesde: '01/02/24',
    fechaHasta: '29/02/24',
    nombreArchivo: 'febrero_2024.xls', // Nombre claro que incluye el mes
    datos: [
      [1, 'J18.9', 'Neumonía no especificada', 42],
      [2, 'I10', 'Hipertensión esencial', 38],
      [3, 'K59.0', 'Estreñimiento', 31],
      [4, 'E11.9', 'Diabetes mellitus tipo 2', 27]
    ]
  },
  {
    mes: 'ABRIL',
    fechaDesde: '01/04/24',
    fechaHasta: '30/04/24',
    nombreArchivo: 'abril_2024.xls', // Nombre claro que incluye el mes
    datos: [
      [1, 'I10', 'Hipertensión esencial', 55],
      [2, 'J44.1', 'EPOC con exacerbación aguda', 48],
      [3, 'E11.9', 'Diabetes mellitus tipo 2', 39],
      [4, 'K59.0', 'Estreñimiento', 33]
    ]
  },
  {
    mes: 'JUNIO',
    fechaDesde: '01/06/24',
    fechaHasta: '30/06/24',
    nombreArchivo: 'junio_2024.xls', // Nombre claro que incluye el mes
    datos: [
      [1, 'J18.9', 'Neumonía no especificada', 61],
      [2, 'I10', 'Hipertensión esencial', 44],
      [3, 'E11.9', 'Diabetes mellitus tipo 2', 36],
      [4, 'J44.1', 'EPOC con exacerbación aguda', 32]
    ]
  },
  {
    mes: 'AGOSTO',
    fechaDesde: '01/08/24',
    fechaHasta: '31/08/24',
    nombreArchivo: 'agosto_2024.xls', // Nombre claro que incluye el mes
    datos: [
      [1, 'I10', 'Hipertensión esencial', 73],
      [2, 'J18.9', 'Neumonía no especificada', 58],
      [3, 'K59.0', 'Estreñimiento', 45],
      [4, 'E11.9', 'Diabetes mellitus tipo 2', 41]
    ]
  },
  {
    mes: 'OCTUBRE',
    fechaDesde: '01/10/24',
    fechaHasta: '31/10/24',
    nombreArchivo: 'octubre_2024.xls', // Nombre claro que incluye el mes
    datos: [
      [1, 'J44.1', 'EPOC con exacerbación aguda', 67],
      [2, 'I10', 'Hipertensión esencial', 52],
      [3, 'J18.9', 'Neumonía no especificada', 47],
      [4, 'E11.9', 'Diabetes mellitus tipo 2', 38]
    ]
  },
  {
    mes: 'DICIEMBRE',
    fechaDesde: '01/12/24',
    fechaHasta: '31/12/24',
    nombreArchivo: 'diciembre_2024.xls', // Nombre claro que incluye el mes
    datos: [
      [1, 'J18.9', 'Neumonía no especificada', 89],
      [2, 'J44.1', 'EPOC con exacerbación aguda', 74],
      [3, 'I10', 'Hipertensión esencial', 65],
      [4, 'K59.0', 'Estreñimiento', 51]
    ]
  }
];

// Crear todos los archivos
archivos.forEach(archivo => {
  crearArchivoPorMes(
    archivo.mes,
    archivo.fechaDesde,
    archivo.fechaHasta,
    archivo.nombreArchivo,
    archivo.datos
  );
});

console.log('\n🎉 ¡Archivos de ejemplo creados exitosamente!');
console.log('\n🧪 Cómo probar el filtrado por mes:');
console.log('1. Ve a Ranking Diagnóstico en la aplicación');
console.log('2. Selecciona un establecimiento y categoría');
console.log('3. Sube TODOS los archivos creados (febrero, abril, junio, agosto, octubre, diciembre)');
console.log('4. Marca SOLO ciertos meses (ej: solo FEBRERO y ABRIL)');
console.log('5. Haz clic en ANALIZAR');
console.log('6. Observa que:');
console.log('   ✅ Solo aparecen archivos de los meses seleccionados');
console.log('   ✅ Se muestra qué archivo se usó para cada mes');
console.log('   ✅ Los resultados son solo de esos meses específicos');
console.log('');
console.log('📁 Archivos disponibles:');
archivos.forEach(archivo => {
  console.log(`   • ${archivo.nombreArchivo} → ${archivo.mes} 2024`);
});
console.log('');
console.log('🎯 ¡Ahora el sistema filtra exactamente por los meses que selecciones!'); 