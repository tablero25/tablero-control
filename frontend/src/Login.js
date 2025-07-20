import React, { useState } from 'react';
import logoSDO from './logoo.png';

function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // URL DIRECTA DE PRODUCCIÓN
  const API_URL = 'https://tablero-control-1.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('🚀 Iniciando login con URL:', `${API_URL}/api/auth/login`);
      
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
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