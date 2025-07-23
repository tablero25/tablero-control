import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

function ConfirmEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    // No hacer nada automáticamente, solo mostrar el botón
    setStatus('ready');
  }, [token]);

  const handleConfirm = async () => {
    setStatus('loading');
    setMessage('Confirmando tu cuenta...');

    try {
      const response = await fetch('https://tablero-control-1.onrender.com/api/auth/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('¡Cuenta confirmada exitosamente! Serás redirigido al login en 3 segundos...');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al confirmar la cuenta. El enlace puede haber expirado.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="container">
          <div className="login-container">
            <div className="login-box">
              <div className="logo-sdo-banner">
                <img src="/static/media/logoo.c9263002735465189850.png" alt="Logo SDO" />
                <h1 className="banner-title">CONFIRMACIÓN DE CUENTA</h1>
              </div>

              <div className="confirm-content">
                {status === 'loading' && (
                  <div className="loading-message">
                    <div className="spinner"></div>
                    <p>{message}</p>
                  </div>
                )}

                {status === 'ready' && (
                  <div className="confirm-message">
                    <h2>¡Bienvenido al Sistema de Tableros de Control!</h2>
                    <p>Para completar tu registro, haz clic en el botón de confirmación.</p>
                    <button 
                      className="confirm-btn"
                      onClick={handleConfirm}
                    >
                      Confirmar Mi Cuenta
                    </button>
                  </div>
                )}

                {status === 'success' && (
                  <div className="success-message">
                    <div className="success-icon">✅</div>
                    <h2>¡Cuenta Confirmada!</h2>
                    <p>{message}</p>
                    <div className="redirect-info">
                      <p>Si no eres redirigido automáticamente, haz clic aquí:</p>
                      <button 
                        className="login-btn"
                        onClick={() => navigate('/login')}
                      >
                        Ir al Login
                      </button>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="error-message">
                    <div className="error-icon">❌</div>
                    <h2>Error de Confirmación</h2>
                    <p>{message}</p>
                    <div className="error-actions">
                      <button 
                        className="retry-btn"
                        onClick={handleConfirm}
                      >
                        Intentar Nuevamente
                      </button>
                      <button 
                        className="login-btn"
                        onClick={() => navigate('/login')}
                      >
                        Ir al Login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmail; 