const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('🧮 Creando archivos para probar SUMA AUTOMÁTICA de múltiples meses...\n');

// Función para crear archivo específico por mes
function crearArchivoPorMes(mes, fechaDesde, fechaHasta, nombreArchivo, datos) {
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICO DE MOTIVOS DE EGRESOS'],
    [],
    ['Desde:', fechaDesde], 
    ['Hasta:', fechaHasta],  
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
  datos.forEach((item, idx) => {
    console.log(`   ${item[0]}. ${item[1]} - ${item[2]}: ${item[3]}`);
  });
  console.log('');
  
  return outputPath;
}

// Crear archivos con diagnósticos comunes para probar suma
const archivos = [
  {
    mes: 'FEBRERO',
    fechaDesde: '01/02/24',
    fechaHasta: '29/02/24',
    nombreArchivo: 'febrero_suma_test.xls',
    datos: [
      [1, 'I10', 'Hipertensión esencial', 25], // Este diagnóstico aparece en los 3 meses
      [2, 'E11.9', 'Diabetes mellitus tipo 2', 20], // Este también
      [3, 'J18.9', 'Neumonía no especificada', 15],
      [4, 'K59.0', 'Estreñimiento', 10]
    ]
  },
  {
    mes: 'MARZO',
    fechaDesde: '01/03/24',
    fechaHasta: '31/03/24',
    nombreArchivo: 'marzo_suma_test.xls',
    datos: [
      [1, 'I10', 'Hipertensión esencial', 30], // +30 = 55 total
      [2, 'E11.9', 'Diabetes mellitus tipo 2', 18], // +18 = 38 total
      [3, 'J44.1', 'EPOC con exacerbación aguda', 22], // Nuevo diagnóstico
      [4, 'K59.0', 'Estreñimiento', 12] // +12 = 22 total
    ]
  },
  {
    mes: 'ABRIL',
    fechaDesde: '01/04/24',
    fechaHasta: '30/04/24',
    nombreArchivo: 'abril_suma_test.xls',
    datos: [
      [1, 'I10', 'Hipertensión esencial', 35], // +35 = 90 total (debería ser #1)
      [2, 'J44.1', 'EPOC con exacerbación aguda', 28], // +28 = 50 total (debería ser #2)
      [3, 'E11.9', 'Diabetes mellitus tipo 2', 12], // +12 = 50 total (debería ser #3)
      [4, 'J18.9', 'Neumonía no especificada', 25] // +25 = 40 total (debería ser #4)
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

console.log('🎯 PRUEBA DE SUMA AUTOMÁTICA:');
console.log('1. Sube los 3 archivos: febrero_suma_test.xls, marzo_suma_test.xls, abril_suma_test.xls');
console.log('2. Marca solo FEBRERO, MARZO y ABRIL');
console.log('3. Haz clic en ANALIZAR');
console.log('4. Los resultados deberían ser:');
console.log('   🥇 #1: I10 - Hipertensión esencial: 90 (25+30+35)');
console.log('   🥈 #2: J44.1 - EPOC con exacerbación aguda: 50 (0+22+28)');
console.log('   🥉 #3: E11.9 - Diabetes mellitus tipo 2: 50 (20+18+12)');
console.log('   4️⃣ #4: J18.9 - Neumonía no especificada: 40 (15+0+25)');
console.log('');
console.log('✅ Esto prueba que:');
console.log('   • Solo analiza archivos de meses seleccionados');
console.log('   • Suma automáticamente diagnósticos repetidos');
console.log('   • Ordena por cantidad total');
console.log('   • Muestra TOP 4 consolidados');
console.log('');
console.log('🚫 El archivo "todo.xls" NO debe incluirse en el análisis si no marcas "TODOS"'); 