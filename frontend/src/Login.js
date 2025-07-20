import React, { useState } from 'react';
import logoSDO from './logoo.png';

function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // URL DIRECTA DE PRODUCCIÓN - FORZADA
  const API_URL = 'https://tablero-control-1.onrender.com';
  
  // Verificar que estamos usando la URL correcta
  console.log('🔧 Login component - API_URL:', API_URL);
  console.log('🔧 Login component - Current location:', window.location.href);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // URL FINAL - FORZADA
    const finalUrl = `${API_URL}/api/auth/login`;
    console.log('🚀 Iniciando login con URL FINAL:', finalUrl);
    
    try {
      const res = await fetch(finalUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('📡 Respuesta del servidor:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('📦 Datos recibidos:', data);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.user.first_login) {
          window.location.href = '/change-password';
        } else {
          window.location.href = '/sistema-tablero';
        }
      } else {
        setError(data.error || 'Error de autenticación');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        url: finalUrl
      });
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
          <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
        {error && <div className="error-msg">{error}</div>}
        
        <div className="register-link">
          ¿No tiene cuenta? <button type="button" onClick={() => window.location.href = '/registrarse'}>Registrarse</button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}

export default Login; 