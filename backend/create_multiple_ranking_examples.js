const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Array de meses
const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

// Función para generar datos aleatorios de diagnósticos
function generarDiagnosticosAleatorios(mes) {
  const diagnosticosBase = [
    ['K529', 'COLITIS Y GASTROENTERITIS NO INFECCIOSAS, NO ESPECIFICADAS'],
    ['J159', 'NEUMONIA BACTERIANA, NO ESPECIFICADA'],
    ['N390', 'INFECCION DE VIAS URINARIAS, SITIO NO ESPECIFICADO'],
    ['K297', 'GASTRITIS, NO ESPECIFICADA'],
    ['J00', 'RINOFARINGITIS AGUDA (RESFRIADO COMUN)'],
    ['Z723', 'PROBLEMAS RELACIONADOS CON LA FALTA DE EJERCICIO FISICO'],
    ['Z000', 'EXAMEN MEDICO GENERAL'],
    ['Z001', 'CONTROL DE SALUD DE RUTINA DEL NIÑO'],
    ['J029', 'FARINGITIS AGUDA, NO ESPECIFICADA'],
    ['M542', 'CERVICALGIA']
  ];
  
  // Mezclar array y tomar los primeros 8
  const diagnosticosShuffled = [...diagnosticosBase].sort(() => Math.random() - 0.5);
  
  // Generar cantidades aleatorias (variando por mes)
  const factor = mes === 'ENERO' ? 1.2 : mes === 'DICIEMBRE' ? 0.8 : 1.0;
  
  return diagnosticosShuffled.slice(0, 8).map((diag, index) => [
    index + 1,
    diag[0],
    diag[1],
    Math.floor((Math.random() * 50 + 20) * factor)
  ]);
}

// Función para crear archivo de un mes específico
function crearArchivoMes(mes, index) {
  const dataEjemplo = [
    ['HOSPITAL SAN CARLOS'],
    [`Ranking de Diagnósticos de Atención - ${mes} 2024`],
    ['Desde', `01/${String(index + 1).padStart(2, '0')}/24`],
    ['Hasta', `31/${String(index + 1).padStart(2, '0')}/24`],
    ['Servicio', '***TODOS'],
    ['Tipo Diag.', '***TODOS'],
    [''],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    ...generarDiagnosticosAleatorios(mes)
  ];

  // Crear workbook y worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(dataEjemplo);

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking');

  return workbook;
}

// Crear directorio si no existe
const outputDir = path.join(__dirname, 'test_files', 'ejemplos_multiples');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generando archivos de ejemplo para múltiples meses...\n');

// Generar archivos para todos los meses
MESES.forEach((mes, index) => {
  const workbook = crearArchivoMes(mes, index);
  
  // Guardar en formato .xls
  const outputPathXLS = path.join(outputDir, `${mes.toLowerCase()}_2024.xls`);
  XLSX.writeFile(workbook, outputPathXLS);
  
  // Guardar en formato .xlsx
  const outputPathXLSX = path.join(outputDir, `${mes.toLowerCase()}_2024.xlsx`);
  XLSX.writeFile(workbook, outputPathXLSX);
  
  console.log(`✓ Creados archivos para ${mes}:`);
  console.log(`  - ${outputPathXLS}`);
  console.log(`  - ${outputPathXLSX}`);
});

console.log('\n🎉 ¡Archivos de ejemplo creados exitosamente!');
console.log('\nPara probar la selección múltiple:');
console.log('1. Ve a la carpeta: backend/test_files/ejemplos_multiples/');
console.log('2. Selecciona varios archivos a la vez (Ctrl+Click o Shift+Click)');
console.log('3. Usa el botón GUARDAR para cargar todos los archivos seleccionados');
console.log('4. Luego usa ANALIZAR para procesar los meses seleccionados');
console.log('\nCada archivo tiene diagnósticos aleatorios para simular datos reales.'); 