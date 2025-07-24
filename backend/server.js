const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// Importar inicialización automática de base de datos
const { checkAndInitializeDatabase } = require('./autoInitDb');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta absoluta a la carpeta de build del frontend
const buildPath = path.join(__dirname, '../frontend/build');
// Servir archivos estáticos del frontend React
app.use(express.static(buildPath));
// También servirlos bajo el prefijo /sistema-tablero para assets como manifest.json, favicon, etc.
app.use('/sistema-tablero', express.static(buildPath));

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
  res.sendFile(path.join(buildPath, 'index.html'));
});

// RUTAS DEL FRONTEND - Todas las rutas que no sean /api/* van al frontend React
app.get('/login', (req, res) => {
  console.log('🔐 Sirviendo página de login');
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/register', (req, res) => {
  console.log('📝 Sirviendo página de registro');
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/confirm', (req, res) => {
  console.log('✅ Sirviendo página de confirmación');
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  console.log('📊 Sirviendo dashboard');
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Rutas de autenticación directas
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔍 Login - Datos recibidos:', { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Respuesta de prueba con token
    res.json({
      success: true,
      token: 'dummy-token',
      message: 'Login funcionando correctamente',
      timestamp: new Date().toISOString(),
      user: {
        username: username,
        role: 'admin',
        first_login: false
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para verificar token (dummy)
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.query.token || null);
  if (token) {
    return res.json({ success: true, user: { username: 'admin', role: 'admin', first_login: false } });
  }
  return res.status(401).json({ success: false, error: 'Token inválido' });
});

app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'API de autenticación funcionando correctamente',
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
  res.sendFile(path.join(buildPath, 'index.html'));
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