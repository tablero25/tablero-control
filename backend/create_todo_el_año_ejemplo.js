const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Datos de ejemplo para TODO EL AÑO 2024
const dataEjemplo = [
  ['HOSPITAL SAN CARLOS'],
  ['Ranking de Motivos de Egresos'],
  ['Desde', '01/01/24'],
  ['Hasta', '31/12/24'],
  ['Servicio', '***TODOS'],
  ['Tipo Diag.', '***TODOS'],
  [''],
  ['#', 'Código', 'Diagnóstico', 'Cantidad'],
  [1, 'K529', 'COLITIS Y GASTROENTERITIS NO INFECCIOSAS, NO ESPECIFICADAS', 450],
  [2, 'J159', 'NEUMONIA BACTERIANA, NO ESPECIFICADA', 380],
  [3, 'N390', 'INFECCION DE VIAS URINARIAS, SITIO NO ESPECIFICADO', 320],
  [4, 'K297', 'GASTRITIS, NO ESPECIFICADA', 290],
  [5, 'J00', 'RINOFARINGITIS AGUDA (RESFRIADO COMUN)', 180],
  [6, 'Z723', 'PROBLEMAS RELACIONADOS CON LA FALTA DE EJERCICIO FISICO', 150],
  [7, 'Z000', 'EXAMEN MEDICO GENERAL', 120],
  [8, 'Z001', 'CONTROL DE SALUD DE RUTINA DEL NIÑO', 100]
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
const outputPathXLS = path.join(outputDir, 'todo_el_año_2024_ranking.xls');
XLSX.writeFile(workbook, outputPathXLS);

console.log('✅ Archivo de ejemplo TODO EL AÑO 2024 creado:');
console.log('📁 Archivo:', outputPathXLS);
console.log('');
console.log('🔍 Este archivo contiene:');
console.log('   - Desde: 01/01/24');
console.log('   - Hasta: 31/12/24');
console.log('   - El sistema detectará automáticamente: TODOS LOS MESES, AÑO = 2024');
console.log('');
console.log('📋 Para probar:');
console.log('1. Sube este archivo en la aplicación');
console.log('2. El sistema automáticamente marcará ☑️ "TODOS" y establecerá año "2024"');
console.log('3. Todos los checkboxes de meses se marcarán automáticamente');
console.log('4. Podrás hacer clic en ANALIZAR para ver los resultados consolidados del año completo'); 