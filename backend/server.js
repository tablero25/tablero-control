const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// Importar inicialización automática de base de datos
const { checkAndInitializeDatabase } = require('./autoInitDb');

// Importar rutas de autenticación
const authRoutes = require('./authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Montar rutas de autenticación
app.use('/api', authRoutes);

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

// RUTAS DEL FRONTEND - Rutas específicas del frontend
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

// Las rutas de API deben tener prioridad sobre el catch-all

app.get('/dashboard', (req, res) => {
  console.log('📊 Sirviendo dashboard');
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Las rutas de autenticación están manejadas por authRoutes.js

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

// Manejador de errores para rutas de API que no existen
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: `Ruta de API no encontrada: ${req.method} ${req.path}`,
    availableRoutes: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/verify',
      'POST /api/auth/reset-users'
    ]
  });
});

// Catch-all para todas las demás rutas del frontend (DEBE IR AL FINAL)
app.get('*', (req, res) => {
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