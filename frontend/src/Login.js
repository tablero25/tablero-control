import React, { useState, useEffect } from 'react';
// import logoSDO from './logoo.png'; // Comentado temporalmente

function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Limpiar cualquier token dummy al cargar el componente
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken === 'dummy-token' || currentToken === 'null' || currentToken === '') {
      localStorage.removeItem('token');
      console.log('Token dummy eliminado al cargar Login');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Limpiar cualquier token previo (incluyendo dummy-token)
    localStorage.removeItem('token');
    
    try {
      const res = await fetch('https://tablero-control-1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      console.log('[LOGIN] Respuesta del servidor:', data);
      
      if (data.success) {
        console.log('[LOGIN] Login exitoso, token recibido:', data.token ? 'Sí' : 'No');
        
        // Asegurar que solo se guarde el token real del backend
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('[LOGIN] Token guardado en localStorage');
        } else {
          console.error('[LOGIN] ERROR: No se recibió token del servidor');
        }
        
        // Guardar también el usuario en localStorage para acceso inmediato
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('[LOGIN] Usuario guardado en localStorage');
        }
        
        // Verificar que el token se guardó correctamente
        const savedToken = localStorage.getItem('token');
        console.log('[LOGIN] Verificación - Token guardado:', savedToken ? 'Sí (JWT válido)' : 'No');
        console.log('[LOGIN] Token completo:', savedToken);
        
        if (data.user.first_login) {
          window.location.href = '/change-password';
        } else {
          window.location.href = '/sistema-tablero';
        }
      } else {
        setError(data.error || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src="/static/media/logoo.c9263002735465189850.png" alt="Logo SDO" />
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