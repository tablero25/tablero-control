const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Crear datos de ejemplo
const data = [
  ['CODEST', 'PERIANO', 'PERIMES', 'UNIOPE', 'SECINT', 'SALA', 'MATRI', 'TIPPROF', 'CODPRO', 'PACVIV', 'PACFAL', 'PASE', 'PACDIA', 'CAMDIS', 'FGRA', 'HGRA', 'UGRA', 'WIDGRA'],
  ['06350', 2024, 1, 200, 3, 0, 911, 90, 0, 57, 0, 0, 119, 279, 45820, '11:26', '', 'SS'],
  ['06350', 2024, 2, 200, 3, 0, 911, 90, 0, 21, 0, 0, 29, 261, 45820, '11:26', '', 'SS'],
  ['06350', 2024, 3, 200, 3, 0, 911, 90, 0, 34, 0, 0, 59, 279, 45820, '11:27', '', 'SS'],
  ['06350', 2024, 4, 200, 3, 0, 911, 90, 0, 32, 1, 0, 103, 270, 45820, '11:28', '', 'SS'],
  ['06350', 2024, 5, 200, 3, 0, 911, 90, 0, 26, 0, 0, 59, 279, 45820, '11:29', '', 'SS']
];

// Crear workbook y worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Agregar worksheet al workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

// Crear directorio si no existe
const outputDir = path.join(__dirname, 'test_files');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Guardar archivo
const outputPath = path.join(outputDir, 'test_data.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('Archivo Excel de prueba creado en:', outputPath);
console.log('Puedes usar este archivo para probar el guardado en la aplicación.'); 