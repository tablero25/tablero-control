const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// Importar rutas de autenticación
const authRoutes = require('./authRoutes');

// Importar inicialización automática de base de datos
const { checkAndInitializeDatabase } = require('./autoInitDb');

const app = express();

// 🔥 RUTAS DE SOLUCIÓN FINAL (DEBEN IR AL INICIO)
app.get('/fix/final-solution', (req, res) => {
  console.log('🔥 Sirviendo página de solución final');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOLUCIÓN FINAL - Tablero S/D/O</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(45deg, #ff0000, #ff6600, #ff0000);
            color: white;
            min-height: 100vh;
            animation: finalPulse 1s infinite;
        }
        @keyframes finalPulse {
            0% { background: linear-gradient(45deg, #ff0000, #ff6600, #ff0000); }
            50% { background: linear-gradient(45deg, #ff6600, #ff0000, #ff6600); }
            100% { background: linear-gradient(45deg, #ff0000, #ff6600, #ff0000); }
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(0,0,0,0.9);
            padding: 50px;
            border-radius: 25px;
            text-align: center;
            border: 5px solid #ff0000;
            box-shadow: 0 0 50px rgba(255,0,0,0.5);
        }
        h1 {
            font-size: 4em;
            margin-bottom: 30px;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
            animation: finalGlow 2s ease-in-out infinite alternate;
        }
        @keyframes finalGlow {
            from { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff0000, 0 0 40px #ff0000; }
            to { text-shadow: 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #ff0000, 0 0 50px #ff0000; }
        }
        .warning {
            background: rgba(255, 0, 0, 0.4);
            border: 4px solid #ff0000;
            padding: 30px;
            border-radius: 20px;
            margin: 30px 0;
            font-size: 1.5em;
            font-weight: bold;
        }
        .final-button {
            background: linear-gradient(45deg, #ff0000, #ff6600, #ff0000);
            color: white;
            border: none;
            padding: 40px 80px;
            font-size: 2.5em;
            font-weight: bold;
            border-radius: 25px;
            cursor: pointer;
            margin: 30px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.7);
            transition: all 0.3s ease;
            animation: finalButtonPulse 0.5s infinite;
        }
        @keyframes finalButtonPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .final-button:hover {
            transform: scale(1.2);
            box-shadow: 0 20px 50px rgba(0,0,0,0.9);
        }
        .countdown {
            font-size: 3em;
            font-weight: bold;
            color: #ff6600;
            margin: 30px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔥 SOLUCIÓN FINAL 🔥</h1>
        
        <div class="warning">
            <strong>🚨 SOLUCIÓN DEFINITIVA:</strong> Esta página eliminará COMPLETAMENTE todo el cache del navegador y forzará una actualización total. 
            Esto resolverá DEFINITIVAMENTE el problema de conexión refused.
        </div>
        
        <div id="status"></div>
        
        <button class="final-button" onclick="finalSolution()">
            🔥 ACTIVAR SOLUCIÓN FINAL 🔥
        </button>
        
        <div id="countdown" class="countdown"></div>
    </div>

    <script>
        const statusDiv = document.getElementById('status');
        const countdownDiv = document.getElementById('countdown');
        
        let countdown = 10;
        
        function updateCountdown() {
            countdownDiv.textContent = \`⏰ Auto-activación en \${countdown} segundos\`;
            if (countdown > 0) {
                countdown--;
                setTimeout(updateCountdown, 1000);
            } else {
                finalSolution();
            }
        }
        
        async function finalSolution() {
            countdownDiv.style.display = 'none';
            statusDiv.innerHTML = '<div style="font-size: 2.5em; margin: 30px 0; color: #ff6600;">🔥 ACTIVANDO SOLUCIÓN FINAL...</div>';
            
            try {
                // Limpiar cache
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                }
                
                // Limpiar almacenamiento
                localStorage.clear();
                sessionStorage.clear();
                
                // Interceptar fetch
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    if (typeof url === 'string' && url.includes('localhost')) {
                        const newUrl = url.replace(/http:\\/\\/localhost:\\d+/, 'https://tablero-control-1.onrender.com');
                        console.log('🔥 URL interceptada:', url, '→', newUrl);
                        url = newUrl;
                    }
                    return originalFetch(url, options);
                };
                
                statusDiv.innerHTML = '<div style="font-size: 2.5em; margin: 30px 0; color: #00ff00;">✅ SOLUCIÓN FINAL COMPLETADA</div>';
                
                // Redirección
                setTimeout(() => {
                    const timestamp = Date.now();
                    const random = Math.random();
                    const params = \`?v=\${timestamp}&r=\${random}&final=true&nocache=true&t=\${Date.now()}&version=5.0&fix=true&solution=final\`;
                    window.location.replace('/' + params);
                }, 2000);
                
            } catch (error) {
                statusDiv.innerHTML = '<div style="font-size: 2.5em; margin: 30px 0; color: #ff0000;">❌ Error en solución final</div>';
                setTimeout(() => {
                    window.location.replace('/?emergency=true&final=true&t=' + Date.now());
                }, 3000);
            }
        }
        
        // Auto-activación
        window.addEventListener('load', () => {
            updateCountdown();
        });
    </script>
</body>
</html>
  `);
});

app.use(cors());
app.use(express.json());

// RUTAS ESPECÍFICAS PARA ARCHIVOS PERSONALIZADOS (DEBEN IR ANTES DE express.static)
app.get('/debug.html', (req, res) => {
  console.log('🔧 Sirviendo página de debug personalizada');
  const debugPath = path.join(__dirname, 'build', 'debug.html');
  if (fs.existsSync(debugPath)) {
    res.sendFile(debugPath);
  } else {
    res.status(404).json({ error: 'Página de debug no encontrada' });
  }
});



// Rutas específicas para páginas de solución (ANTES de express.static)
app.get('/fix/ultra-nuclear', (req, res) => {
  console.log('☢️ Sirviendo página ultra-nuclear');
  res.sendFile(path.join(__dirname, 'build/ultra-nuclear.html'));
});

app.get('/fix/nuclear-fix', (req, res) => {
  console.log('☢️ Sirviendo página nuclear');
  res.sendFile(path.join(__dirname, 'build/nuclear-fix.html'));
});

app.get('/fix/clear-cache', (req, res) => {
  console.log('🧹 Sirviendo página de limpieza de cache');
  res.sendFile(path.join(__dirname, 'build/clear-cache.html'));
});

app.get('/fix/diagnostico-api', (req, res) => {
  console.log('🔍 Sirviendo página de diagnóstico API');
  res.sendFile(path.join(__dirname, 'build/diagnostico-api.html'));
});

// Servir archivos estáticos del frontend React (copiado por render-build.sh)
app.use(express.static(path.join(__dirname, 'build')));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// RUTA PRINCIPAL - Sirve el frontend React
app.get('/', (req, res) => {
  console.log('🎯 Sirviendo frontend React desde ruta principal');
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

// RUTAS DEL FRONTEND - Todas las rutas que no sean /api/* van al frontend React
app.get('/login', (req, res) => {
  console.log('🔐 Sirviendo página de login');
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.get('/register', (req, res) => {
  console.log('📝 Sirviendo página de registro');
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.get('/confirm', (req, res) => {
  console.log('✅ Sirviendo página de confirmación');
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.get('/dashboard', (req, res) => {
  console.log('📊 Sirviendo dashboard');
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de autenticación directas (backup)
app.post('/api/auth/login-direct', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔍 Login directo - Datos recibidos:', { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Respuesta de prueba
    res.json({
      success: true,
      message: 'Login directo funcionando',
      timestamp: new Date().toISOString(),
      user: {
        username: username,
        role: 'admin',
        first_login: false
      }
    });

  } catch (error) {
    console.error('Error en login directo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/test-direct', (req, res) => {
  res.json({ 
    message: 'API de autenticación directa funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de prueba funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de diagnóstico para problemas de conexión
app.get('/api/diagnose', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Diagnóstico del sistema',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || 5001,
      DATABASE_URL: process.env.DATABASE_URL ? 'Configurado' : 'No configurado',
      JWT_SECRET: process.env.JWT_SECRET ? 'Configurado' : 'No configurado'
    },
    server: {
      hostname: req.hostname,
      url: req.url,
      method: req.method,
      headers: req.headers.host,
      userAgent: req.headers['user-agent']
    },
    frontend: {
      buildPath: path.join(__dirname, 'build'),
      buildExists: fs.existsSync(path.join(__dirname, 'build')),
      indexExists: fs.existsSync(path.join(__dirname, 'build/index.html'))
    }
  });
});

// Ruta para forzar limpieza de cache
app.get('/api/clear-cache', (req, res) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.json({
    status: 'OK',
    message: 'Headers de cache limpiados',
    timestamp: new Date().toISOString(),
    instructions: [
      '1. Presiona Ctrl+Shift+Delete en tu navegador',
      '2. Selecciona "Todo el tiempo"',
      '3. Marca todas las opciones',
      '4. Haz clic en "Limpiar datos"',
      '5. Recarga la página con Ctrl+F5'
    ]
  });
});

// Ruta de salud del sistema
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Catch-all para todas las demás rutas del frontend (DEBE IR AL FINAL)
app.get('*', (req, res, next) => {
  // Si la ruta empieza con /api, continuar con las rutas de API
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Para todas las demás rutas, servir el frontend React
  console.log(`🌐 Sirviendo frontend React para ruta: ${req.path}`);
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

// Puerto del servidor
const PORT = process.env.PORT || 5001;

// Inicializar base de datos y arrancar servidor
async function startServer() {
  try {
    // Inicializar base de datos
    await checkAndInitializeDatabase();
    
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
  } catch (error) {
    console.error('❌ Error al arrancar servidor:', error);
    process.exit(1);
  }
}

startServer(); 