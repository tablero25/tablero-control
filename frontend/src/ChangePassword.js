import React, { useState } from 'react';
import logoSDO from './logoo.png';
import API_BASE_URL, { getApiUrl } from './config';

function ChangePassword({ onCancel, onSuccess, isFirstLogin = false }) {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    if (formData.oldPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl('/api/auth/change-password'), {
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
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Error al cambiar la contraseña');
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
          <h1 className="banner-title">
            {isFirstLogin ? 'CAMBIO DE CONTRASEÑA OBLIGATORIO' : 'CAMBIAR CONTRASEÑA'}
          </h1>
        </div>
        <div className="container">
          <div className="config-panel" style={{maxWidth: '500px'}}>
            <div className="config-header">
              <h2>{isFirstLogin ? 'Primer Inicio de Sesión' : 'Cambiar Contraseña'}</h2>
            </div>
            
            {isFirstLogin && (
              <div className="info-box" style={{marginBottom: '20px', background: '#fff3cd', border: '1px solid #ffeaa7'}}>
                <h3 style={{color: '#856404', marginBottom: '10px'}}>⚠️ Cambio de contraseña requerido</h3>
                <p style={{color: '#856404', margin: 0}}>
                  Por seguridad, debe cambiar su contraseña en el primer inicio de sesión. 
                  Su contraseña actual es su número de DNI.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Contraseña Actual {isFirstLogin && '(su DNI)'}</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder={isFirstLogin ? "Ingrese su DNI" : "Contraseña actual"}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Repetir Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirme la nueva contraseña"
                  required
                  className="form-control"
                />
              </div>

              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}

              <div className="button-group">
                <button type="submit" className="config-btn">
                  Cambiar Contraseña
                </button>
                {!isFirstLogin && onCancel && (
                  <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword; 