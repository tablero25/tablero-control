const express = require('express');
const pool = require('./db');
const { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  authenticateToken, 
  requireRole,
  getUserEstablecimientos 
} = require('./auth');
const { sendConfirmationEmail, sendWelcomeEmail } = require('./emailService');
const crypto = require('crypto');

const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Buscar usuario (case-insensitive)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND is_active = true',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña (case-insensitive)
    const isValidPassword = await verifyPassword(password.toLowerCase(), user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Obtener establecimientos del usuario
    const establecimientos = await getUserEstablecimientos(user.id);

    // Generar token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        dni: user.dni,
        nombre: user.nombre,
        apellido: user.apellido,
        funcion: user.funcion,
        first_login: user.first_login
      },
      establecimientos
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const establecimientos = await getUserEstablecimientos(req.user.id);
    
    res.json({
      success: true,
      user: req.user,
      establecimientos
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro público de usuarios con email
router.post('/register', async (req, res) => {
  try {
    const { dni, nombre, apellido, funcion, username, email } = req.body;
    
    if (!dni || !nombre || !apellido || !funcion || !username || !email) {
      return res.status(400).json({ error: 'Todos los campos son requeridos, incluyendo email' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el DNI, username o email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE dni = $1 OR username = $2 OR email = $3',
      [dni, username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'DNI, usuario o email ya existe' });
    }

    // Generar token de confirmación
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    
    // Usar DNI como contraseña temporal
    const hashedPassword = await hashPassword(dni);

    // Crear usuario con email no confirmado
    const newUser = await pool.query(
      `INSERT INTO users (
        dni, nombre, apellido, funcion, username, password_hash, role, email, 
        is_active, confirmation_token, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
      RETURNING id, username, dni, nombre, apellido, funcion, role, email`,
      [dni, nombre, apellido, funcion, username, hashedPassword, 'ESTABLECIMIENTO', email, false, confirmationToken]
    );

    // Enviar email de confirmación
    const emailResult = await sendConfirmationEmail(email, confirmationToken, nombre);
    
    if (!emailResult.success) {
      // Si falla el envío de email, eliminar el usuario creado
      await pool.query('DELETE FROM users WHERE id = $1', [newUser.rows[0].id]);
      return res.status(500).json({ error: 'Error enviando email de confirmación. Intenta nuevamente.' });
    }

    res.json({
      success: true,
      message: 'Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta.',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email,
        nombre: newUser.rows[0].nombre,
        apellido: newUser.rows[0].apellido
      }
    });

  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar contraseña
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    // Obtener usuario actual
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña actual (case-insensitive)
    const isValidPassword = await verifyPassword(oldPassword.toLowerCase(), user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await hashPassword(newPassword);

    // Actualizar contraseña y marcar que ya no es primer login
    await pool.query(
      'UPDATE users SET password_hash = $1, first_login = FALSE WHERE id = $2',
      [hashedNewPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear usuario (solo ADMIN)
router.post('/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!['ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Usuario o email ya existe' });
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role]
    );

    res.json({
      success: true,
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Listar usuarios (solo ADMIN)
router.get('/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at,
             u.dni, u.nombre, u.apellido, u.funcion,
             COUNT(ue.establecimiento_id) as establecimientos_count
      FROM users u
      LEFT JOIN user_establecimientos ue ON u.id = ue.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users: result.rows
    });

  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Bloquear/Desbloquear usuario (solo ADMIN)
router.put('/users/:userId/toggle-status', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario existe
    const userResult = await pool.query('SELECT id, is_active, username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    const newStatus = !user.is_active;

    // Actualizar estado
    await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2',
      [newStatus, userId]
    );

    res.json({
      success: true,
      message: `Usuario ${user.username} ${newStatus ? 'activado' : 'bloqueado'} correctamente`,
      is_active: newStatus
    });

  } catch (error) {
    console.error('Error cambiando estado de usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Blanquear contraseña de usuario (solo ADMIN)
router.put('/users/:userId/reset-password', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario existe
    const userResult = await pool.query('SELECT id, username, dni, role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // No permitir blanquear contraseña del administrador principal
    if (user.role === 'ADMIN' && user.username === '35477889') {
      return res.status(400).json({ error: 'No se puede blanquear la contraseña del administrador principal' });
    }

    // Establecer la contraseña igual al DNI (o username si no hay DNI)
    const newPassword = user.dni || user.username;
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña y marcar como primer login
    await pool.query(
      'UPDATE users SET password_hash = $1, first_login = TRUE WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: `Contraseña de ${user.username} blanqueada correctamente. Nueva contraseña: ${newPassword}`,
      newPassword: newPassword
    });

  } catch (error) {
    console.error('Error blanqueando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario (solo ADMIN)
router.delete('/users/:userId', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario existe
    const userResult = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // No permitir eliminar al administrador principal
    if (user.role === 'ADMIN' && user.username === '35477889') {
      return res.status(400).json({ error: 'No se puede eliminar al administrador principal' });
    }

    // Eliminar usuario (cascade eliminará las relaciones)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: `Usuario ${user.username} eliminado correctamente`
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Asignar establecimiento a usuario (solo ADMIN)
router.post('/users/:userId/establecimientos', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { establecimientoId, isPrimary = false } = req.body;

    // Verificar que el usuario existe
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el establecimiento existe
    const establecimientoResult = await pool.query('SELECT id FROM establecimientos WHERE id = $1', [establecimientoId]);
    if (establecimientoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    // Asignar establecimiento
    await pool.query(
      'INSERT INTO user_establecimientos (user_id, establecimiento_id, is_primary, assigned_by) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, establecimiento_id) DO UPDATE SET is_primary = $3',
      [userId, establecimientoId, isPrimary, req.user.id]
    );

    res.json({
      success: true,
      message: 'Establecimiento asignado correctamente'
    });

  } catch (error) {
    console.error('Error asignando establecimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Confirmar usuario pendiente (solo ADMIN)
router.put('/users/:userId/confirm', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    // Verificar que el usuario existe
    const userResult = await pool.query('SELECT id, is_active FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Activar usuario
    await pool.query('UPDATE users SET is_active = true WHERE id = $1', [userId]);
    res.json({ success: true, message: 'Usuario confirmado correctamente' });
  } catch (error) {
    console.error('Error confirmando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Confirmar email de usuario
router.get('/confirm-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Token de confirmación requerido' });
    }

    // Buscar usuario con el token de confirmación
    const userResult = await pool.query(
      'SELECT id, username, email, nombre, apellido, is_active FROM users WHERE confirmation_token = $1',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token de confirmación inválido o expirado' });
    }

    const user = userResult.rows[0];

    // Verificar si ya está confirmado
    if (user.is_active) {
      return res.json({
        success: true,
        message: 'Tu cuenta ya está confirmada. Puedes iniciar sesión.',
        alreadyConfirmed: true
      });
    }

    // Activar usuario y limpiar token de confirmación
    await pool.query(
      'UPDATE users SET is_active = true, confirmation_token = NULL WHERE id = $1',
      [user.id]
    );

    // Enviar email de bienvenida
    await sendWelcomeEmail(user.email, user.nombre);

    res.json({
      success: true,
      message: '¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión.',
      user: {
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido
      }
    });

  } catch (error) {
    console.error('Error confirmando email:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reenviar email de confirmación
router.post('/resend-confirmation', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    // Buscar usuario por email
    const userResult = await pool.query(
      'SELECT id, username, email, nombre, apellido, is_active, confirmation_token FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Verificar si ya está confirmado
    if (user.is_active) {
      return res.status(400).json({ error: 'Tu cuenta ya está confirmada' });
    }

    // Generar nuevo token de confirmación
    const newConfirmationToken = crypto.randomBytes(32).toString('hex');
    
    // Actualizar token de confirmación
    await pool.query(
      'UPDATE users SET confirmation_token = $1 WHERE id = $1',
      [newConfirmationToken, user.id]
    );

    // Enviar nuevo email de confirmación
    const emailResult = await sendConfirmationEmail(user.email, newConfirmationToken, user.nombre);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Error enviando email de confirmación' });
    }

    res.json({
      success: true,
      message: 'Email de confirmación reenviado exitosamente'
    });

  } catch (error) {
    console.error('Error reenviando confirmación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 