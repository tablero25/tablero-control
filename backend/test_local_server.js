const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas de autenticación
const authRoutes = require('./authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Montar rutas de autenticación
app.use('/api', authRoutes);

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
  
  // Para todas las demás rutas GET, servir respuesta simple
  console.log(`🌐 Ruta GET no encontrada: ${req.path}`);
  res.status(404).json({ 
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
    message: 'Esta ruta no está disponible'
  });
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

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor local iniciado en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('📋 Rutas disponibles:');
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/test');
  console.log('  - POST /api/auth/login');
  console.log('  - POST /api/auth/register');
  console.log('  - GET  /api/auth/verify');
  console.log('  - POST /api/auth/reset-users');
}); 