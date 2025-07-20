import React, { useState } from 'react';
import logoSDO from './logoo.png';

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // URL DIRECTA DE PRODUCCIÓN
  const API_URL = 'https://tablero-control-1.onrender.com';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      console.log('🚀 Cambiando contraseña con URL:', `${API_URL}/api/auth/change-password`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Contraseña cambiada exitosamente');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirigir al sistema después de 2 segundos
        setTimeout(() => {
          window.location.href = '/sistema-tablero';
        }, 2000);
      } else {
        setError(data.error || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">TABLERO S/D/O</h1>
        </div>
        <div className="container">
          <form className="change-password-form" onSubmit={handleSubmit}>
            <h2>Cambiar Contraseña</h2>
            <p>Por favor, cambie su contraseña por defecto</p>
            
            <input
              type="password"
              name="currentPassword"
              placeholder="Contraseña Actual"
              value={formData.currentPassword}
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
            
            <button type="submit">Cambiar Contraseña</button>
            
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword; 