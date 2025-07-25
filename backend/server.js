// FORCE COMPLETE REDEPLOY: 2025-07-26T02:09:46.135Z
// This change forces Render to completely restart the server
// FORCE SERVER RESTART: 2025-07-26T02:02:51.853Z
// FORCE REDEPLOY: 2025-07-26T01:58:07.301Z
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// Importar inicialización automática de base de datos
const { checkAndInitializeDatabase } = require('./autoInitDb');

// Las rutas de autenticación se definen directamente aquí

const app = express();
app.use(cors());
app.use(express.json());

// Las rutas de autenticación se montan después del catch-all

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

// RUTAS DE AUTENTICACIÓN DEFINIDAS DIRECTAMENTE
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth routes funcionando correctamente' });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Respuesta simple para probar
    res.json({
      success: true,
      message: 'Login funcionando',
      user: { username, role: 'admin' }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, dni, nombre, apellido, funcion } = req.body;
    
    if (!username || !email || !dni || !nombre || !apellido || !funcion) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Respuesta simple para probar
    res.json({
      success: true,
      message: 'Registro funcionando',
      user: { username, email, nombre, apellido }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Verificación funcionando',
    user: { id: 1, username: 'test', role: 'admin' }
  });
});

// Catch-all para rutas GET del frontend (excluyendo /api)
app.get('*', (req, res) => {
  // Solo manejar rutas que NO empiecen con /api
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: `Ruta de API no encontrada: ${req.method} ${req.path}`,
      availableRoutes: [
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/auth/verify',
        'POST /api/auth/reset-users'
      ]
    });
  }
  
  // Para todas las demás rutas GET, servir el frontend React
  console.log(`🌐 Sirviendo frontend React para ruta: ${req.path}`);
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Manejador para rutas POST que no sean de API
app.post('*', (req, res) => {
  // Solo manejar rutas que NO empiecen con /api
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: `Ruta de API no encontrada: ${req.method} ${req.path}`,
      availableRoutes: [
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/auth/verify',
        'POST /api/auth/reset-users'
      ]
    });
  }
  
  // Para todas las demás rutas POST, devolver error 404
  console.log(`❌ Ruta POST no encontrada: ${req.path}`);
  res.status(404).json({ 
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
    message: 'Esta ruta no está disponible'
  });
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