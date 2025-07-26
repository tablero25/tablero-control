const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_SECRET = 'sdo_tablero_secret_key_2025';

// Función para hashear contraseñas
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Función para verificar contraseñas
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Función para generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Middleware para verificar JWT con renovación automática
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    // Verificar el token
    const user = jwt.verify(token, JWT_SECRET);
    
    // Verificar si el token está a punto de expirar (menos de 30 minutos)
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = user.exp - now;
    
    // Si el token está a punto de expirar, emitir uno nuevo
    if (expiresIn < 1800) { // 30 minutos en segundos
      console.log('Token a punto de expirar, renovando...');
      const newToken = generateToken(user);
      res.set('X-Token-Expired-Soon', 'true');
      res.set('X-New-Token', newToken);
    }
    
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Token inválido', details: err.message });
  }
};

// Middleware para verificar roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    next();
  };
};

// Función para obtener establecimientos de un usuario
const getUserEstablecimientos = async (userId) => {
  const query = `
    SELECT e.id, e.nombre, e.zona, ue.is_primary
    FROM establecimientos e
    JOIN user_establecimientos ue ON e.id = ue.establecimiento_id
    WHERE ue.user_id = $1 AND e.activo = true
    ORDER BY ue.is_primary DESC, e.nombre
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateToken,
  requireRole,
  getUserEstablecimientos,
  JWT_SECRET
}; 