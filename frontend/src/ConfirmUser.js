import React, { useState, useEffect } from 'react';

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
        console.log('🚀 Confirmando usuario con URL:', `${API_URL}/api/auth/confirm`);
        
        const res = await fetch(`${API_URL}/api/auth/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        const data = await res.json();
        
        if (data.success) {
          setMessage('¡Usuario confirmado exitosamente! Ya puede iniciar sesión.');
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
              <p>Confirmando usuario...</p>
            ) : (
              <>
                <p>{message}</p>
                <button onClick={() => window.location.href = '/'}>
                  Ir al Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmUser; 