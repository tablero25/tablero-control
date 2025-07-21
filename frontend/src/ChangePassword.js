import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoSDO from './logoo.png';

function ChangePassword({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('https://tablero-control-1.onrender.com/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    })
    .catch(() => {
      localStorage.removeItem('token');
      navigate('/login');
    });
  }, [navigate]);

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
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://tablero-control-1.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Contraseña cambiada exitosamente');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        if (onSuccess) onSuccess();
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
          <h1 className="banner-title">TABLERO S/D/O</h1>
        </div>
        <div className="container">
          <div className="modal-content">
            <form className="login-form" onSubmit={handleSubmit}>
          <h2>Cambiar Contraseña</h2>
          
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