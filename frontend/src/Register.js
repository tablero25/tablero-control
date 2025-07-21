import React, { useState } from 'react';
import logoSDO from './logoo.png';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    funcion: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dni') {
      setFormData({
        ...formData,
        dni: value,
        username: value // usuario igual al dni
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://tablero-control-1.onrender.com:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: formData.dni,
          nombre: formData.nombre,
          apellido: formData.apellido,
          funcion: formData.funcion,
          username: formData.username
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Usuario registrado exitosamente. Puede iniciar sesión.');
        setFormData({
          dni: '',
          nombre: '',
          apellido: '',
          funcion: '',
          username: ''
        });
        if (onRegister) onRegister();
      } else {
        setError(data.error || 'Error al registrar usuario');
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
          <h1 className="banner-title">TABLERO S/D/O</h1>
        </div>
        <div className="container">
          <form className="login-form register-form" onSubmit={handleSubmit}>
        <h2>Registro de Usuario</h2>
        
        <input
          type="text"
          name="dni"
          placeholder="DNI"
          value={formData.dni}
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
          name="funcion"
          placeholder="Función"
          value={formData.funcion}
          onChange={handleChange}
          required
        />
        
        <input
          type="text"
          name="username"
          placeholder="Usuario (DNI)"
          value={formData.username}
          readOnly
          required
        />
        
        <div style={{textAlign: 'center', color: '#666', fontSize: '0.9rem', marginTop: '10px'}}>
          <p>Su usuario y contraseña será su DNI</p>
        </div>
        
        <button type="submit">Registrarse</button>
        
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        
        <div className="login-link">
          ¿Ya tiene cuenta? <button type="button" onClick={() => window.location.href = '/login'}>Iniciar Sesión</button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}

export default Register; 