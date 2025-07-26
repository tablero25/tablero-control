import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoSDO from './logoo.png';

function ChangePassword({ onCancel, onSuccess }) {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  
  // Obtener usuario del localStorage si está disponible
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Si el usuario no tiene rol, intentar refrescar la información del servidor
      if (user && !user.role) {
        console.log('[CHANGE-PASSWORD] Usuario sin rol detectado, intentando refrescar información');
        // No limpiar localStorage inmediatamente, permitir que el usuario intente refrescar
        return user;
      }
      
      return user;
    } catch (e) {
      console.log('[CHANGE-PASSWORD] Error parseando usuario del localStorage:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  
  const [formData, setFormData] = useState({
    username: currentUser ? currentUser.username : '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Función para refrescar la información del usuario desde el servidor
  const refreshUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[CHANGE-PASSWORD] No hay token, redirigiendo al login');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('https://tablero-control-1.onrender.com/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        console.log('[CHANGE-PASSWORD] Información del usuario refrescada:', data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload(); // Recargar para usar la nueva información
      } else {
        console.log('[CHANGE-PASSWORD] Error refrescando usuario, limpiando localStorage');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } catch (err) {
      console.log('[CHANGE-PASSWORD] Error de conexión al refrescar usuario');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.username) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    console.log('[CHANGE-PASSWORD] Intentando cambiar contraseña para:', formData.username);

    try {
      const res = await fetch('https://tablero-control-1.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Contraseña cambiada exitosamente');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.error || 'Error al cambiar contraseña');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">CAMBIO DE CONTRASEÑA</h1>
        </div>
        <div className="container">
          <div className="modal-content">
            <form className="login-form" onSubmit={handleSubmit}>
          <h2>Cambiar Contraseña</h2>
          {currentUser && (
            <div style={{ 
              background: '#e3f2fd', 
              padding: '10px', 
              borderRadius: '5px', 
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              Cambiando contraseña para: <strong>{currentUser.username}</strong>
                             {!currentUser.role && (
                 <div style={{ marginTop: '5px', color: '#d32f2f' }}>
                   ⚠️ Información de usuario incompleta. 
                   <button 
                     onClick={refreshUserInfo} 
                     style={{ 
                       background: 'none', 
                       border: 'none', 
                       color: '#1976d2', 
                       textDecoration: 'underline', 
                       cursor: 'pointer',
                       marginLeft: '5px'
                     }}
                   >
                     Refrescar información
                   </button>
                 </div>
               )}
            </div>
          )}
          
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            readOnly={!!currentUser}
            required
          />
          
          <input
            type="password"
            name="oldPassword"
            placeholder="Contraseña Actual"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="newPassword"
            placeholder="Nueva Contraseña"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar Nueva Contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <div className="button-group">
            <button type="submit">Cambiar Contraseña</button>
            <button type="button" onClick={onCancel} className="cancel-btn">Cancelar</button>
          </div>
          
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
        </form>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword; 