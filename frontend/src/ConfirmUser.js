import React, { useState, useEffect } from 'react';
import logoSDO from './logoo.png';
import './ConfirmUser.css';

function ConfirmUser() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // URL DIRECTA DE PRODUCCIÓN
  const API_URL = 'https://tablero-control-1.onrender.com';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setMessage('Token de confirmación no válido');
      setLoading(false);
      return;
    }

    const confirmUser = async () => {
      try {
        console.log('🚀 Confirmando usuario con URL:', `${API_URL}/api/auth/confirmar-usuario?token=${token}`);
        
        const res = await fetch(`${API_URL}/api/auth/confirmar-usuario?token=${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const data = await res.json();
        
        if (data.success) {
          setMessage('¡Usuario confirmado exitosamente! Ya puede iniciar sesión.');
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setMessage(data.error || 'Error al confirmar usuario');
        }
      } catch (err) {
        console.error('❌ Error de conexión:', err);
        setMessage('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    confirmUser();
  }, []);

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">TABLERO S/D/O</h1>
        </div>
        <div className="container">
          <div className="confirm-form">
            <h2>Confirmación de Usuario</h2>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Confirmando tu cuenta...</p>
              </div>
            ) : (
              <div className="result-state">
                <div className={`status-icon ${message.includes('exitosamente') ? 'success' : 'error'}`}>
                  {message.includes('exitosamente') ? '✅' : '❌'}
                </div>
                <p className="message">{message}</p>
                {message.includes('exitosamente') && (
                  <p className="redirect-info">Serás redirigido al login en 3 segundos...</p>
                )}
                <button 
                  className="login-button"
                  onClick={() => window.location.href = '/'}
                >
                  Ir al Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmUser; 