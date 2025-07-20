import React, { useState, useEffect } from 'react';
import logoSDO from './logoo.png';

function RolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // URL DIRECTA DE PRODUCCIÓN
  const API_URL = 'https://tablero-control-1.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('🚀 Obteniendo usuarios con URL:', `${API_URL}/api/auth/users`);
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        setError('Error al obtener usuarios');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      console.log('🚀 Cambiando rol con URL:', `${API_URL}/api/auth/users/${userId}/role`);
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage('Rol actualizado exitosamente');
        fetchUsers(); // Recargar lista
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Error al actualizar rol');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError('Error de conexión con el servidor');
    }
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
              <h2>Gestión de Roles</h2>
            </div>
            
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}
            
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Establecimiento</th>
                    <th>Rol Actual</th>
                    <th>Cambiar Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.nombre} {user.apellido}</td>
                      <td>{user.email}</td>
                      <td>{user.establecimiento}</td>
                      <td>
                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.username === '35477889'} // Proteger admin principal
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPERVISOR">SUPERVISOR</option>
                          <option value="ESTABLECIMIENTO">ESTABLECIMIENTO</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="config-actions">
              <button onClick={() => window.location.href = '/configuracion'} className="back-btn">
                Volver a Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolesPage; 