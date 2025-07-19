import React, { useState } from 'react';
import logoSDO from './logoo.png';

// Lista completa de establecimientos por zona
const ZONAS = [
  {
    nombre: 'ZONA CENTRO',
    establecimientos: [
      '47 Materno Infantil', '40 San Bernardo', '55 Papa Francisco', '41 Señor Del Milagro',
      '43 Oñativia', '42 Ragone', '45 P.N.A. zona norte', '56 P.N.A. zona sur',
      'Centro de Rehabilitación', 'Oncologia', 'Adicciones', 'CUCAI', 'Samec'
    ]
  },
  {
    nombre: 'ZONA NORTE',
    establecimientos: [
      '1 Colonia Sta. Rosa', '2 Pichanal', '3 Aguaray', '4 Morillo', '7 P. Salvador Maza',
      '8 Sta. Victoria Este', '9 Embarcación', '11 Oran', '12 Tartagal', '13 Rivadavia',
      '28 Gral. Enrique Mosconi', '31 Hipólito Yrigoyen', '44 Alto  la Sierra', '49 Urundel', '51 La Unión'
    ]
  },
  {
    nombre: 'ZONA SUR',
    establecimientos: [
      '14 Las Lajitas', '15 J. V. González', '16 El Quebrachal', '17 El Galpón',
      '18 Rosario de la Frontera', '19 Metan', '21 El Tala', '22 Gral. Güemes',
      '23 Apolinario Saravia', '38 El Potrero'
    ]
  },
  {
    nombre: 'ZONA OESTE',
    establecimientos: [
      '5 Sta. Victoria Oeste', '6 Iruya', '10 Nazareno', '24 Cafayate', '25 San Carlos',
      '26 Molinos', '27 Cachi', '29 San Antonio de los Cobres', '30 Cerrillos',
      '32 Rosario de Lerma', '33 Chicoana', '34 El Carril', '35 Cnel. Moldes',
      '36 La Viña', '37 Guachipas', '39 La Caldera', '46 Campo Quijano',
      '48 Seclantas', '50 La Merced', '52 La Poma', '53 Angastaco'
    ]
  }
];

// Crear lista plana de todos los establecimientos
const TODOS_ESTABLECIMIENTOS = ZONAS.flatMap(zona => zona.establecimientos).sort();

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    funcion: '',
    email: '',
    username: '',
    establecimiento: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    // Validar que se seleccionó un establecimiento
    if (!formData.establecimiento) {
      setError('Debe seleccionar un establecimiento.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: formData.dni,
          nombre: formData.nombre,
          apellido: formData.apellido,
          funcion: formData.funcion,
          email: formData.email,
          username: formData.username,
          establecimiento: formData.establecimiento
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
        setFormData({
          dni: '',
          nombre: '',
          apellido: '',
          funcion: '',
          email: '',
          username: '',
          establecimiento: ''
        });
        if (onRegister) onRegister();
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">TABLEROS DE CONTROL - INDICADORES DE GESTIÓN</h1>
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
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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

            <select
              name="establecimiento"
              value={formData.establecimiento}
              onChange={handleChange}
              required
              className="establecimiento-select"
            >
              <option value="">Seleccione un establecimiento</option>
              {TODOS_ESTABLECIMIENTOS.map(est => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
            
            <div style={{textAlign: 'center', color: '#666', fontSize: '0.9rem', marginTop: '10px'}}>
              <p>Su usuario y contraseña será su DNI</p>
              <p>Se le asignará automáticamente el rol de Establecimiento</p>
              <p>Recibirá un email de confirmación para activar su cuenta</p>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
            
            <div className="register-link">
              ¿Ya tiene cuenta? <button type="button" onClick={() => window.location.href = '/login'}>Iniciar Sesión</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register; 