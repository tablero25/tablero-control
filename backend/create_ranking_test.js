const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Datos de ejemplo basados en el archivo de San Carlos
const dataEjemplo = [
  ['HOSPITAL SAN CARLOS'],
  ['Ranking de Diagnósticos de Atención'],
  ['Desde', '01/01/24'],
  ['Hasta', '31/12/24'],
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

// Guardar archivos en ambos formatos
const outputPathXLS = path.join(outputDir, 'ranking_diagnostico_ejemplo.xls');
const outputPathXLSX = path.join(outputDir, 'ranking_diagnostico_ejemplo.xlsx');

XLSX.writeFile(workbook, outputPathXLS);
XLSX.writeFile(workbook, outputPathXLSX);

console.log('Archivos Excel de ranking de diagnósticos creados:');
console.log('- Formato XLS:', outputPathXLS);
console.log('- Formato XLSX:', outputPathXLSX);
console.log('');
console.log('Estos archivos contienen el formato correcto para probar el sistema de ranking.');
console.log('Estructura:');
console.log('- Headers en fila 8: #, Código, Diagnóstico, Cantidad');
console.log('- Datos de diagnósticos con los primeros 4 siendo los más relevantes');
console.log('- Ahora se pueden seleccionar múltiples archivos a la vez para cargar'); 