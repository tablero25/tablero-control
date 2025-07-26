const express = require('express');
const authRoutes = require('./backend/authRoutes');

const app = express();
app.use(express.json());

// Montar rutas de autenticación
app.use('/api', authRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API de prueba funcionando correctamente' });
});

// Puerto del servidor
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor local corriendo en puerto ${PORT}`);
  console.log('📋 Rutas disponibles:');
  console.log('- GET  /api/test');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
  console.log('- GET  /api/auth/verify');
  console.log('');
  console.log('🔗 Prueba las rutas con:');
  console.log(`curl http://localhost:${PORT}/api/test`);
  console.log(`curl -X POST http://localhost:${PORT}/api/auth/login -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'`);
}); 