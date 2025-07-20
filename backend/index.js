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