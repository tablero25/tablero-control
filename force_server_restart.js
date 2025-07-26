const fs = require('fs');
const path = require('path');

// Agregar un comentario temporal para forzar el redeploy
const serverPath = path.join(__dirname, 'backend', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Agregar un comentario con timestamp para forzar el redeploy
const timestamp = new Date().toISOString();
const deployComment = `// FORCE SERVER RESTART: ${timestamp}\n`;

// Insertar el comentario al inicio del archivo
content = deployComment + content;

fs.writeFileSync(serverPath, content);

console.log('🔄 Forzando reinicio completo del servidor en Render.com...');
console.log(`📝 Agregado comentario: ${deployComment.trim()}`);
console.log('💡 Ahora ejecuta: git add . && git commit -m "Force server restart" && git push origin main');
console.log('⏳ Espera 2-3 minutos después del push para que Render reinicie completamente el servidor'); 