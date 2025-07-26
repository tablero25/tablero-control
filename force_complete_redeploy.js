const fs = require('fs');
const path = require('path');

// Agregar un comentario temporal para forzar el redeploy
const serverPath = path.join(__dirname, 'backend', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Agregar un comentario con timestamp para forzar el redeploy
const timestamp = new Date().toISOString();
const deployComment = `// FORCE COMPLETE REDEPLOY: ${timestamp}\n// This change forces Render to completely restart the server\n`;

// Insertar el comentario al inicio del archivo
content = deployComment + content;

fs.writeFileSync(serverPath, content);

console.log('🔄 Forzando redeploy completo en Render.com...');
console.log(`📝 Agregado comentario: ${deployComment.trim()}`);
console.log('💡 Ahora ejecuta: git add . && git commit -m "Force complete redeploy" && git push origin main');
console.log('⏳ Espera 3-5 minutos después del push para que Render reinicie completamente el servidor');
console.log('🔍 Después de eso, prueba el registro de usuarios en la aplicación web'); 