const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware de autenticación (ajusta según tu sistema)
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  next();
}

router.get('/api/establecimientos', requireAuth, async (req, res) => {
  const { id, rol } = req.user;
  try {
    let result;
    if (rol === 'ADMIN' || rol === 'DIRECTOR') {
      result = await pool.query('SELECT * FROM establecimientos');
    } else if (rol === 'JEFE_ZONA' || rol === 'GERENTE') {
      result = await pool.query(
        `SELECT e.* FROM establecimientos e
         JOIN user_establecimientos ue ON e.id = ue.establecimiento_id
         WHERE ue.user_id = $1`, [id]
      );
    } else {
      return res.status(403).json({ error: 'Rol no permitido' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener establecimientos' });
  }
});

module.exports = router; 