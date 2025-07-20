import React, { useState } from 'react';
import logoSDO from './logoo.png';

function Register({ onShowLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    establecimiento: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // URL DIRECTA DE PRODUCCIÓN
  const API_URL = 'https://tablero-control-1.onrender.com';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      console.log('🚀 Iniciando registro con URL:', `${API_URL}/api/auth/register`);
      
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Usuario registrado exitosamente. Por favor revise su email para confirmar su cuenta.');
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          nombre: '',
          apellido: '',
          establecimiento: ''
        });
      } else {
        setError(data.error || 'Error en el registro');
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
          <form className="register-form" onSubmit={handleSubmit}>
            <h2>Registro de Usuario</h2>
            
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              value={formData.username}
              onChange={handleChange}
              required
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
            
            <input
              type="text"
              name="establecimiento"
              placeholder="Establecimiento"
              value={formData.establecimiento}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            
            <button type="submit">Registrarse</button>
            
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
            
            <div className="login-link">
              ¿Ya tiene cuenta? <button type="button" onClick={() => window.location.href = '/'}>Iniciar Sesión</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register; 