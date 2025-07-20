import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logoSDO from './logoo.png';
import API_BASE_URL, { getApiUrl } from './config';

function ConfirmUser() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('confirming');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (token) {
      confirmUser(token);
    }
  }, [token]);

  const confirmUser = async (confirmationToken) => {
    try {
      const response = await fetch(getApiUrl(`/api/auth/confirm/${confirmationToken}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al confirmar la cuenta');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión con el servidor');
    }
  };

  const handleResendConfirmation = async (e) => {
    e.preventDefault();
    if (!email) {
      setResendStatus('Por favor ingresa tu email');
      return;
    }

    setResendStatus('Enviando...');
    try {
      const response = await fetch(getApiUrl('/api/auth/resend-confirmation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setResendStatus('Email de confirmación reenviado. Revisa tu bandeja de entrada.');
      } else {
        setResendStatus(data.error || 'Error al reenviar el email');
      }
    } catch (error) {
      setResendStatus('Error de conexión con el servidor');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  const renderContent = () => {
    switch (status) {
      case 'confirming':
        return (
          <div className="confirm-loading">
            <div className="spinner"></div>
            <p>Confirmando tu cuenta...</p>
          </div>
        );

      case 'success':
        return (
          <div className="confirm-success">
            <div className="success-icon">✓</div>
            <h2>¡Cuenta Confirmada!</h2>
            <p>{message}</p>
            {/* userInfo is no longer available, so this block is removed */}
            <div className="button-group">
              <button onClick={handleGoToLogin} className="btn-primary">
                Ir al Login
              </button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="confirm-expired">
            <div className="expired-icon">⏰</div>
            <h2>Token Expirado</h2>
            <p>{message}</p>
            <p>El enlace de confirmación ha expirado. Puedes solicitar un nuevo enlace.</p>
            <div className="button-group">
              <button onClick={handleResendConfirmation} className="btn-secondary">
                Reenviar Email
              </button>
              <button onClick={handleGoToRegister} className="btn-primary">
                Registrarse Nuevamente
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="confirm-error">
            <div className="error-icon">✗</div>
            <h2>Error de Confirmación</h2>
            <p>{message}</p>
            <div className="button-group">
              <button onClick={handleGoToRegister} className="btn-primary">
                Registrarse
              </button>
              <button onClick={handleGoToLogin} className="btn-secondary">
                Ir al Login
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="confirm-user-container">
      <div className="confirm-user-card">
        <div className="confirm-header">
          <img src={logoSDO} alt="Logo SDO" className="logo" />
          <h1>Confirmación de Usuario</h1>
          <p>Tableros de Control - Indicadores de Gestión</p>
        </div>
        
        <div className="confirm-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ConfirmUser; 