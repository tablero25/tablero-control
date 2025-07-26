const express = require('express');
const router = express.Router();

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes funcionando correctamente' });
});

// Login simplificado
router.post('/login', async (req, res) => {
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

// Registro simplificado
router.post('/register', async (req, res) => {
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

// Verificar token simplificado
router.get('/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Verificación funcionando',
    user: { id: 1, username: 'test', role: 'admin' }
  });
});

module.exports = router; 