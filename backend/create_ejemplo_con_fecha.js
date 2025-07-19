const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Función para crear archivo Excel con fechas específicas
function crearArchivoConFecha(nombreArchivo, fechaDesde, fechaHasta, diagnosticos) {
  // Datos de ejemplo
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICO'], // Título
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

  console.log(`Archivo creado: ${nombreArchivo}`);
  console.log(`Desde: ${fechaDesde} | Hasta: ${fechaHasta}`);
  return outputPath;
}

// Diagnósticos de ejemplo para diferentes archivos
const diagnosticosEjemplo = {
  enero: [
    [1, 'J44.1', 'Enfermedad pulmonar obstructiva crónica con exacerbación aguda', 45],
    [2, 'I10', 'Hipertensión esencial', 38],
    [3, 'E11.9', 'Diabetes mellitus tipo 2 sin complicaciones', 32],
    [4, 'J18.9', 'Neumonía no especificada', 28]
  ],
  febrero: [
    [1, 'J18.9', 'Neumonía no especificada', 52],
    [2, 'I10', 'Hipertensión esencial', 41],
    [3, 'J44.1', 'Enfermedad pulmonar obstructiva crónica con exacerbación aguda', 35],
    [4, 'K59.0', 'Estreñimiento', 29]
  ],
  marzo: [
    [1, 'I10', 'Hipertensión esencial', 48],
    [2, 'E11.9', 'Diabetes mellitus tipo 2 sin complicaciones', 42],
    [3, 'J44.1', 'Enfermedad pulmonar obstructiva crónica con exacerbación aguda', 37],
    [4, 'J18.9', 'Neumonía no especificada', 33]
  ]
};

console.log('Creando archivos Excel de ejemplo con fechas específicas...\n');

// Crear archivos para meses específicos de 2024
crearArchivoConFecha('enero_2024_ranking.xls', '01/01/24', '31/01/24', diagnosticosEjemplo.enero);
crearArchivoConFecha('febrero_2024_ranking.xls', '01/02/24', '29/02/24', diagnosticosEjemplo.febrero);
crearArchivoConFecha('marzo_2024_ranking.xls', '01/03/24', '31/03/24', diagnosticosEjemplo.marzo);

// Crear archivo de todo el año 2024
const diagnosticosTodoElAño = [
  [1, 'I10', 'Hipertensión esencial', 127],
  [2, 'J44.1', 'Enfermedad pulmonar obstructiva crónica con exacerbación aguda', 117],
  [3, 'E11.9', 'Diabetes mellitus tipo 2 sin complicaciones', 108],
  [4, 'J18.9', 'Neumonía no especificada', 95]
];
crearArchivoConFecha('todo_el_año_2024_ranking.xls', '01/01/24', '31/12/24', diagnosticosTodoElAño);

// Crear archivos para 2025
crearArchivoConFecha('enero_2025_ranking.xls', '01/01/25', '31/01/25', diagnosticosEjemplo.enero);
crearArchivoConFecha('todo_el_año_2025_ranking.xls', '01/01/25', '31/12/25', diagnosticosTodoElAño);

console.log('\n✅ Archivos de ejemplo creados correctamente!');
console.log('\nPuedes usar estos archivos para probar:');
console.log('1. Detección automática de año 2024 y 2025');
console.log('2. Detección automática de meses específicos');
console.log('3. Detección automática de "TODOS" los meses para archivos anuales');
console.log('\nLos archivos están en: backend/test_files/'); 