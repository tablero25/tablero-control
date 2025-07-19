import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import './ConfirmUser.css';

const ConfirmUser = () => {
  const [searchParams] = useSearchParams();
  const { token: tokenParam } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, expired
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const confirmUser = async () => {
      // Obtener token de parámetros de ruta o de consulta
      const token = tokenParam || searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de confirmación no encontrado');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/api/auth/confirm/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          setUserInfo(data.user);
        } else {
          if (data.error.includes('expirado')) {
            setStatus('expired');
          } else {
            setStatus('error');
          }
          setMessage(data.error);
        }
      } catch (error) {
        console.error('Error confirmando usuario:', error);
        setStatus('error');
        setMessage('Error de conexión. Intenta nuevamente.');
      }
    };

    confirmUser();
  }, [searchParams, tokenParam]);

  const handleResendEmail = async () => {
    if (!userInfo?.email) {
      setMessage('No se puede reenviar el email sin información del usuario');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userInfo.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email de confirmación reenviado exitosamente. Revisa tu bandeja de entrada.');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Error reenviando email:', error);
      setMessage('Error reenviando email. Intenta nuevamente.');
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
      case 'loading':
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
            {userInfo && (
              <div className="user-info">
                <p><strong>Usuario:</strong> {userInfo.username}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
              </div>
            )}
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
              <button onClick={handleResendEmail} className="btn-secondary">
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
          <img src="/logoSDO.png" alt="Logo SDO" className="logo" />
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