const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Función para crear archivo Excel con fechas específicas de 2025
function crearArchivo2025(nombreArchivo, fechaDesde, fechaHasta, mes, diagnosticos) {
  // Datos de ejemplo
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICO DE MOTIVOS DE EGRESOS'], // Título
    [], // Fila vacía
    ['Desde:', fechaDesde], // Fecha desde
    ['Hasta:', fechaHasta], // Fecha hasta
    [], // Fila vacía
    ['', '', 'RANKING DE DIAGNÓSTICOS'], // Subtítulo
    [], // Fila vacía
    ['#', 'Código', 'Diagnóstico', 'Cantidad'], // Headers
    ...diagnosticos // Datos de diagnósticos
  ];

  // Crear workbook y worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking');

  // Crear directorio si no existe
  const outputDir = path.join(__dirname, 'test_files');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Guardar archivo
  const outputPath = path.join(outputDir, nombreArchivo);
  XLSX.writeFile(workbook, outputPath);

  console.log(`✅ ${nombreArchivo} - ${mes} 2025`);
  console.log(`   Desde: ${fechaDesde} | Hasta: ${fechaHasta}`);
  return outputPath;
}

// Diagnósticos de ejemplo para diferentes meses
const diagnosticosPorMes = {
  enero: [
    [1, 'K59.0', 'Estreñimiento', 45],
    [2, 'I10', 'Hipertensión esencial', 38],
    [3, 'E11.9', 'Diabetes mellitus tipo 2', 32],
    [4, 'J44.1', 'EPOC con exacerbación aguda', 28]
  ],
  febrero: [
    [1, 'J18.9', 'Neumonía no especificada', 52],
    [2, 'I10', 'Hipertensión esencial', 41],
    [3, 'K59.0', 'Estreñimiento', 35],
    [4, 'E11.9', 'Diabetes mellitus tipo 2', 29]
  ],
  marzo: [
    [1, 'I10', 'Hipertensión esencial', 48],
    [2, 'E11.9', 'Diabetes mellitus tipo 2', 42],
    [3, 'J44.1', 'EPOC con exacerbación aguda', 37],
    [4, 'K59.0', 'Estreñimiento', 33]
  ],
  abril: [
    [1, 'K59.0', 'Estreñimiento', 55],
    [2, 'I10', 'Hipertensión esencial', 44],
    [3, 'J18.9', 'Neumonía no especificada', 38],
    [4, 'E11.9', 'Diabetes mellitus tipo 2', 31]
  ]
};

console.log('🎯 Creando archivos Excel para 2025...\n');

// Crear archivos para meses específicos de 2025
crearArchivo2025('enero_2025.xls', '01/01/25', '31/01/25', 'ENERO', diagnosticosPorMes.enero);
crearArchivo2025('febrero_2025.xls', '01/02/25', '28/02/25', 'FEBRERO', diagnosticosPorMes.febrero);
crearArchivo2025('marzo_2025.xls', '01/03/25', '31/03/25', 'MARZO', diagnosticosPorMes.marzo);
crearArchivo2025('abril_2025.xls', '01/04/25', '30/04/25', 'ABRIL', diagnosticosPorMes.abril);

// Crear archivo de todo el año 2025
const diagnosticosTodoElAño2025 = [
  [1, 'I10', 'Hipertensión esencial', 171],
  [2, 'K59.0', 'Estreñimiento', 168],
  [3, 'E11.9', 'Diabetes mellitus tipo 2', 134],
  [4, 'J44.1', 'EPOC con exacerbación aguda', 105]
];
crearArchivo2025('todo_el_año_2025.xls', '01/01/25', '31/12/25', 'TODOS LOS MESES', diagnosticosTodoElAño2025);

console.log('\n🎉 ¡Archivos de 2025 creados correctamente!');
console.log('\n📋 Instrucciones para usar:');
console.log('1. Abre la aplicación y ve a Ranking Diagnóstico');
console.log('2. Selecciona cualquier establecimiento y categoría');
console.log('3. Asegúrate de que el año sea 2025');
console.log('4. Sube uno o varios archivos de los creados');
console.log('5. Observa cómo se detectan automáticamente los meses');
console.log('6. Haz clic en ANALIZAR para ver los resultados');
console.log('\n📁 Los archivos están en: backend/test_files/'); 