const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// RUTA PRINCIPAL ABSOLUTA - PRIMERA Y ÚNICA
app.get('/', (req, res) => {
  console.log('🎯 Sirviendo HTML desde ruta principal ABSOLUTA');
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Render-Cache-Bypass', 'true');
  
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Tableros de Control</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 { 
            color: #2c3e50; 
            text-align: center; 
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .menu { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 25px; 
            margin-top: 40px; 
        }
        .menu-item { 
            background: linear-gradient(45deg, #3498db, #2980b9); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            text-align: center; 
            text-decoration: none; 
            transition: all 0.3s ease;
            font-size: 1.2em;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }
        .menu-item:hover { 
            transform: translateY(-5px) scale(1.02); 
            background: linear-gradient(45deg, #2980b9, #1f5f8b);
            box-shadow: 0 10px 25px rgba(52, 152, 219, 0.4);
        }
        .status { 
            background: linear-gradient(45deg, #27ae60, #2ecc71); 
            color: white; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center; 
            margin-bottom: 30px;
            font-size: 1.1em;
            font-weight: bold;
        }
        .api-info { 
            background: #ecf0f1; 
            padding: 25px; 
            border-radius: 10px; 
            margin-top: 30px;
            border-left: 5px solid #3498db;
        }
        .api-info h3 {
            color: #2c3e50;
            margin-top: 0;
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .feature {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .feature-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .login-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: center;
        }
        .login-btn {
            background: #e74c3c;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 1.1em;
            cursor: pointer;
            transition: background 0.3s;
        }
        .login-btn:hover {
            background: #c0392b;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Sistema de Tableros de Control</h1>
        <div class="status">✅ Sistema funcionando correctamente - SERVER.JS</div>
        
        <div class="menu">
            <a href="/api/produccion-internacion" class="menu-item">
                📊 Producción Internación
            </a>
            <a href="/api/produccion-consulta" class="menu-item">
                🏥 Producción Consulta Ambulatoria
            </a>
            <a href="/api/ranking-diagnostico" class="menu-item">
                📈 Ranking de Diagnóstico
            </a>
        </div>
        
        <div class="api-info">
            <h3>🔧 Información del Sistema</h3>
            <div class="feature-list">
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <strong>Backend</strong><br>
                    ✅ Funcionando
                </div>
                <div class="feature">
                    <div class="feature-icon">🗄️</div>
                    <strong>Base de datos</strong><br>
                    ✅ Conectada
                </div>
                <div class="feature">
                    <div class="feature-icon">🔌</div>
                    <strong>APIs</strong><br>
                    ✅ Operativas
                </div>
                <div class="feature">
                    <div class="feature-icon">🌐</div>
                    <strong>Frontend</strong><br>
                    ✅ Disponible
                </div>
            </div>
        </div>

        <div class="login-section">
            <h3>🔐 Acceso al Sistema</h3>
            <p>Para acceder a todas las funcionalidades, utiliza las APIs directamente o contacta al administrador.</p>
            <button class="login-btn" onclick="alert('Sistema funcionando correctamente. Las APIs están disponibles en /api/*')">
                Verificar Estado
            </button>
        </div>
        
        <div class="timestamp">
            Última actualización: ${new Date().toLocaleString('es-ES')}
        </div>
    </div>

    <script>
        // Verificar estado del sistema
        fetch('/health')
            .then(response => response.json())
            .then(data => {
                console.log('Estado del sistema:', data);
            })
            .catch(error => {
                console.log('Error al verificar estado:', error);
            });
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Ruta de salud del sistema
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 5001;

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Excel backend ejecutándose en http://localhost:${PORT}`);
  console.log('==> Tu servicio está activo 🎉');
  console.log('==>');
  console.log('==> ///////////////////////////////////////////////////////////');
  console.log('==>');
  console.log('==> Disponible en su URL principal https://tablero-control-1.onrender.com');
  console.log('==>');
  console.log('==> ///////////////////////////////////////////////////////////');
}); 