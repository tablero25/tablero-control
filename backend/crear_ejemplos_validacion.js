const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('📋 Creando ejemplos de validación para cada categoría...\n');

function crearRankingEmergencia() {
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICO DE EMERGENCIA'],
    [],
    ['Desde:', '01/01/24'],
    ['Hasta:', '31/01/24'],
    [],
    ['RANKING DE DIAGNÓSTICOS DE EMERGENCIA - ENERO 2024'],
    [],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    [1, 'R06.0', 'Disnea', 50],
    [2, 'R50.9', 'Fiebre no especificada', 35],
    [3, 'R10.4', 'Dolor abdominal', 30],
    [4, 'S72.0', 'Fractura del cuello del fémur', 25]
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2024');

  const outputPath = path.join(__dirname, 'test_files', 'ranking_emergencia_ejemplo.xls');
  XLSX.writeFile(workbook, outputPath);
  console.log('✅ ranking_emergencia_ejemplo.xls - VÁLIDO para "Ranking de diagnóstico de emergencia"');
}

function crearRankingAtencion() {
  const data = [
    ['HOSPITAL RANKING DE DIAGNÓSTICOS DE ATENCIÓN'],
    [],
    ['Desde:', '01/01/24'],
    ['Hasta:', '31/01/24'],
    [],
    ['RANKING DE DIAGNÓSTICOS DE ATENCIÓN - ENERO 2024'],
    [],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    [1, 'I10', 'Hipertensión esencial', 80],
    [2, 'E11.9', 'Diabetes mellitus tipo 2', 65],
    [3, 'K59.0', 'Estreñimiento', 45],
    [4, 'J44.1', 'EPOC con exacerbación aguda', 40]
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2024');

  const outputPath = path.join(__dirname, 'test_files', 'ranking_atencion_ejemplo.xls');
  XLSX.writeFile(workbook, outputPath);
  console.log('✅ ranking_atencion_ejemplo.xls - VÁLIDO para "Ranking de diagnósticos de atención"');
}

function crearRankingMortalidad() {
  const data = [
    ['HOSPITAL RANKING DE MORTALIDAD'],
    [],
    ['Desde:', '01/01/24'],
    ['Hasta:', '31/01/24'],
    [],
    ['RANKING DE MORTALIDAD - ENERO 2024'],
    [],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    [1, 'I46.9', 'Paro cardíaco no especificado', 15],
    [2, 'J44.0', 'EPOC con infección respiratoria aguda', 12],
    [3, 'C78.0', 'Tumor maligno secundario del pulmón', 10],
    [4, 'N18.6', 'Enfermedad renal crónica estadio 5', 8]
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2024');

  const outputPath = path.join(__dirname, 'test_files', 'ranking_mortalidad_ejemplo.xls');
  XLSX.writeFile(workbook, outputPath);
  console.log('✅ ranking_mortalidad_ejemplo.xls - VÁLIDO para "Ranking de mortalidad"');
}

function crearRankingMotivosEgresos() {
  const data = [
    ['HOSPITAL RANKING DE MOTIVOS DE EGRESOS'],
    [],
    ['Desde:', '01/01/24'],
    ['Hasta:', '31/01/24'],
    [],
    ['RANKING DE MOTIVOS DE EGRESOS - ENERO 2024'],
    [],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    [1, 'K529', 'Colitis y gastroenteritis no infecciosas', 70],
    [2, 'J159', 'Neumonía bacteriana no especificada', 36],
    [3, 'N390', 'Infección de vías urinarias', 28],
    [4, 'K297', 'Gastritis no especificada', 15]
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2024');

  const outputPath = path.join(__dirname, 'test_files', 'ranking_motivos_egresos_ejemplo.xls');
  XLSX.writeFile(workbook, outputPath);
  console.log('✅ ranking_motivos_egresos_ejemplo.xls - VÁLIDO para "Ranking de motivos de egresos"');
}

function crearArchivoIncorrecto() {
  const data = [
    ['HOSPITAL RANKING DE ALGO DIFERENTE'],
    [],
    ['Desde:', '01/01/24'],
    ['Hasta:', '31/01/24'],
    [],
    ['RANKING DE ALGO QUE NO EXISTE - ENERO 2024'],
    [],
    ['#', 'Código', 'Diagnóstico', 'Cantidad'],
    [1, 'X00', 'Diagnóstico inventado', 10],
    [2, 'Y99', 'Otro diagnóstico falso', 5]
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enero 2024');

  const outputPath = path.join(__dirname, 'test_files', 'archivo_incorrecto_ejemplo.xls');
  XLSX.writeFile(workbook, outputPath);
  console.log('❌ archivo_incorrecto_ejemplo.xls - SERÁ RECHAZADO por cualquier categoría');
}

// Crear directorio si no existe
const outputDir = path.join(__dirname, 'test_files');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar todos los archivos
crearRankingEmergencia();
crearRankingAtencion();
crearRankingMortalidad();
crearRankingMotivosEgresos();
crearArchivoIncorrecto();

console.log('\n🎯 PRUEBAS DE VALIDACIÓN:');
console.log('1. Sube "ranking_emergencia_ejemplo.xls" a "Ranking de diagnóstico de emergencia" → ✅ DEBE FUNCIONAR');
console.log('2. Sube "ranking_emergencia_ejemplo.xls" a "Ranking de mortalidad" → ❌ DEBE SER RECHAZADO');
console.log('3. Sube "archivo_incorrecto_ejemplo.xls" a cualquier categoría → ❌ DEBE SER RECHAZADO');
console.log('4. Cada archivo SOLO debe funcionar en su categoría correspondiente');
console.log('\n🔧 VALIDACIÓN IMPLEMENTADA:');
console.log('✅ Verifica que el título del Excel coincida con la categoría seleccionada');
console.log('✅ Rechaza archivos que no tengan el formato correcto');
console.log('✅ Muestra mensajes de error específicos');
console.log('✅ Elimina archivos rechazados automáticamente'); 