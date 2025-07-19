const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Datos de ejemplo para MAYO 2024
const dataEjemplo = [
  ['HOSPITAL SAN CARLOS'],
  ['Ranking de Motivos de Egresos'],
  ['Desde', '01/05/24'],
  ['Hasta', '31/05/24'],
  ['Servicio', '***TODOS'],
  ['Tipo Diag.', '***TODOS'],
  [''],
  ['#', 'Código', 'Diagnóstico', 'Cantidad'],
  [1, 'K529', 'COLITIS Y GASTROENTERITIS NO INFECCIOSAS, NO ESPECIFICADAS', 73],
  [2, 'J159', 'NEUMONIA BACTERIANA, NO ESPECIFICADA', 38],
  [3, 'N390', 'INFECCION DE VIAS URINARIAS, SITIO NO ESPECIFICADO', 32],
  [4, 'K297', 'GASTRITIS, NO ESPECIFICADA', 19],
  [5, 'J00', 'RINOFARINGITIS AGUDA (RESFRIADO COMUN)', 15],
  [6, 'Z723', 'PROBLEMAS RELACIONADOS CON LA FALTA DE EJERCICIO FISICO', 12],
  [7, 'Z000', 'EXAMEN MEDICO GENERAL', 10],
  [8, 'Z001', 'CONTROL DE SALUD DE RUTINA DEL NIÑO', 8]
];

// Crear workbook y worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(dataEjemplo);

// Agregar worksheet al workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking');

// Crear directorio si no existe
const outputDir = path.join(__dirname, 'test_files');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Guardar archivo en formato .xls
const outputPathXLS = path.join(outputDir, 'mayo_2024_ranking.xls');
XLSX.writeFile(workbook, outputPathXLS);

console.log('✅ Archivo de ejemplo MAYO 2024 creado:');
console.log('📁 Archivo:', outputPathXLS);
console.log('');
console.log('🔍 Este archivo contiene:');
console.log('   - Desde: 01/05/24');
console.log('   - Hasta: 31/05/24');
console.log('   - El sistema detectará automáticamente: MES = MAYO, AÑO = 2024');
console.log('');
console.log('📋 Para probar:');
console.log('1. Sube este archivo en la aplicación');
console.log('2. El sistema automáticamente marcará "MAYO" y establecerá año "2024"');
console.log('3. Podrás hacer clic en ANALIZAR para ver los resultados'); 