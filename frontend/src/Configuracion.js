import React, { useState, useEffect } from 'react';
import logoSDO from './logoo.png';

function Configuracion() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // URL DIRECTA DE PRODUCCIÓN
  const API_URL = 'https://tablero-control-1.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    const fetchUser = async () => {
      try {
        console.log('🚀 Obteniendo datos de usuario con URL:', `${API_URL}/api/auth/profile`);
        
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setError('Error al obtener datos del usuario');
        }
      } catch (err) {
        console.error('❌ Error de conexión:', err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleChangePassword = () => {
    window.location.href = '/change-password';
  };

  if (loading) {
    return (
      <div className="App">
        <div className="tablero-bg">
          <div className="logo-sdo-banner">
            <img src={logoSDO} alt="Logo SDO" />
            <h1 className="banner-title">TABLERO S/D/O</h1>
          </div>
          <div className="container">
            <div className="config-panel">
              <p>Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">TABLERO S/D/O</h1>
        </div>
        <div className="container">
          <div className="config-panel">
            <div className="config-header">
              <h2>Configuración de Usuario</h2>
            </div>
            
            {error && <div className="error-msg">{error}</div>}
            
            {user && (
              <div className="user-info">
                <h3>Información del Usuario</h3>
                <p><strong>Usuario:</strong> {user.username}</p>
                <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Establecimiento:</strong> {user.establecimiento}</p>
                <p><strong>Rol:</strong> {user.rol}</p>
              </div>
            )}
            
            <div className="config-actions">
              <button onClick={handleChangePassword} className="config-btn">
                Cambiar Contraseña
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Cerrar Sesión
              </button>
              <button onClick={() => window.location.href = '/sistema-tablero'} className="back-btn">
                Volver al Sistema
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracion; 