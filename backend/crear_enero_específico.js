const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('📅 Creando archivo específico de ENERO para completar la prueba...\n');

function crearEnero() {
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICO DE MOTIVOS DE EGRESOS'],
    [],
    ['Desde:', '01/01/24'], // Específicamente enero
    ['Hasta:', '31/01/24'], // Específicamente enero
    [],
    ['RANKING DE DIAGNÓSTICOS - ENERO 2024'],
    [],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    [1, 'J44.1', 'EPOC con exacerbación aguda', 50],
    [2, 'I10', 'Hipertensión esencial', 45],
    [3, 'E11.9', 'Diabetes mellitus tipo 2', 35],
    [4, 'K59.0', 'Estreñimiento', 30]
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2024');

  const outputDir = path.join(__dirname, 'test_files');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'enero.xls');
  XLSX.writeFile(workbook, outputPath);

  console.log('✅ enero.xls');
  console.log('   📅 01/01/24 - 31/01/24 → ENERO');
  console.log('   1. J44.1 - EPOC con exacerbación aguda: 50');
  console.log('   2. I10 - Hipertensión esencial: 45');
  console.log('   3. E11.9 - Diabetes mellitus tipo 2: 35');
  console.log('   4. K59.0 - Estreñimiento: 30');
  console.log('');
  console.log('🎯 Ahora cuando marques SOLO ENERO:');
  console.log('   ✅ Debe aparecer SOLO el archivo "enero.xls"');
  console.log('   ❌ NO debe aparecer "todo.xls" (ese es solo para TODOS)');
  
  return outputPath;
}

crearEnero();

console.log('\n📋 Archivos disponibles para pruebas:');
console.log('• enero.xls → Solo enero');
console.log('• febrero_suma_test.xls → Solo febrero');
console.log('• marzo_suma_test.xls → Solo marzo');
console.log('• abril_suma_test.xls → Solo abril');
console.log('• todo.xls → Todo el año (solo aparece si marcas TODOS)');
console.log('');
console.log('🚀 ¡Listo para probar!'); 