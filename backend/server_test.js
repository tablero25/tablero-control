// FORCE COMPLETE REDEPLOY: 2025-07-26T02:20:00.000Z
// Test server with direct auth routes
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Definir rutas de autenticación directamente
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    res.json({
      success: true,
      message: 'Login funcionando directamente',
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

    res.json({
      success: true,
      message: 'Registro funcionando directamente',
      user: { username, email, nombre, apellido }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth routes funcionando directamente' });
});

app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Verificación funcionando directamente',
    user: { id: 1, username: 'test', role: 'admin' }
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
        'GET /api/auth/test'
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
        'GET /api/auth/test'
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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba iniciado en puerto ${PORT}`);
  console.log('📋 Rutas disponibles:');
  console.log('  - POST /api/auth/login');
  console.log('  - POST /api/auth/register');
  console.log('  - GET  /api/auth/verify');
  console.log('  - GET  /api/auth/test');
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/test');
}); 