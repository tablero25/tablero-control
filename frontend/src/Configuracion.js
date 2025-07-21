import React, { useState, useEffect } from 'react';
import logoSDO from './logoo.png';

// Utilidad para fetch con token
function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers || {};
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return fetch(url, { ...options, headers });
}

function Configuracion({ onClose }) {
  const [activeSection, setActiveSection] = useState('main');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (section === 'usuarios') {
      loadUsers();
    } else if (section === 'perfiles') {
      window.location.href = '/perfiles';
    }
  };

  const handleBack = () => {
    if (activeSection === 'main') {
      onClose();
    } else {
      setActiveSection('main');
    }
  };

  // Cargar usuarios
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth('https://tablero-control-1.onrender.com/api/auth/users');
      const data = await response.json();
      
      if (data.success) {
        // Asegurar que todos los campos estén presentes y sean visibles
        const processedUsers = data.users.map(user => ({
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          dni: user.dni || '',
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          funcion: user.funcion || '',
          role: user.role || '',
          is_active: user.is_active !== undefined ? user.is_active : true,
          first_login: user.first_login !== undefined ? user.first_login : false,
          created_at: user.created_at || '',
          establecimientos_count: user.establecimientos_count || 0
        }));
        
        console.log('Usuarios cargados:', processedUsers);
        setUsers(processedUsers);
      } else {
        setError(data.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Bloquear/Desbloquear usuario
  const handleToggleStatus = async (userId) => {
    try {
      const response = await fetchWithAuth(`http://localhost:5001/api/auth/users/${userId}/toggle-status`, {
        method: 'PUT'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        loadUsers(); // Recargar lista
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Error al cambiar estado');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`¿Está seguro que desea eliminar al usuario ${username}?`)) {
      return;
    }

    try {
      const response = await fetchWithAuth(`http://localhost:5001/api/auth/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        loadUsers(); // Recargar lista
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Error al eliminar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleResetPassword = async (userId, username) => {
    if (!window.confirm(`¿Está seguro que desea blanquear la contraseña del usuario ${username}?`)) {
      return;
    }

    try {
      const response = await fetchWithAuth(`http://localhost:5001/api/auth/users/${userId}/reset-password`, {
        method: 'PUT'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        loadUsers(); // Recargar lista
        setTimeout(() => setMessage(''), 5000); // Más tiempo para leer la nueva contraseña
      } else {
        setError(data.error || 'Error al blanquear contraseña');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  // Confirmar usuario pendiente
  const handleConfirmUser = async (userId) => {
    if (!window.confirm('¿Está seguro que desea confirmar este usuario?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`http://localhost:5001/api/auth/users/${userId}/confirm`, {
        method: 'PUT'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        loadUsers(); // Recargar lista
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Error al confirmar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  if (activeSection === 'main') {
    return (
      <div className="App">
        <div className="tablero-bg">
          <div className="logo-sdo-banner">
            <img src={logoSDO} alt="Logo SDO" />
            <h1 className="banner-title">CONFIGURACIÓN DEL SISTEMA</h1>
          </div>
          <div className="container">
            <div className="config-panel">
              <div className="config-header">
                <button className="back-btn" onClick={handleBack}>
                  ← Volver
                </button>
                <h2>Panel de Configuración</h2>
              </div>
              
              <div className="config-buttons">
                <button 
                  className="config-option-btn"
                  onClick={() => handleSectionClick('usuarios')}
                >
                  <div className="config-icon">👥</div>
                  <div className="config-text">
                    <h3>Usuarios</h3>
                    <p>Gestionar usuarios del sistema</p>
                  </div>
                </button>

                <button 
                  className="config-option-btn"
                  onClick={() => handleSectionClick('confirmar-usuarios')}
                >
                  <div className="config-icon">✅</div>
                  <div className="config-text">
                    <h3>Confirmar Usuarios</h3>
                    <p>Confirmar y activar usuarios pendientes</p>
                  </div>
                </button>

                <button 
                  className="config-option-btn"
                  onClick={() => handleSectionClick('perfiles')}
                >
                  <div className="config-icon">🔐</div>
                  <div className="config-text">
                    <h3>Perfiles</h3>
                    <p>Gestionar roles y permisos</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Secciones específicas
  const renderSection = () => {
    switch (activeSection) {
      case 'usuarios':
        // Filtrar usuarios pendientes (is_active === false)
        const pendingUsers = users.filter(u => !u.is_active);
        return (
          <div className="config-section">
            <h2>Gestión de Usuarios</h2>
            <p>Gestionar todos los usuarios del sistema.</p>
            <div style={{marginBottom: '20px'}}>
              <button 
                className="config-btn" 
                onClick={() => window.location.href = '/gestion-usuarios'}
                style={{marginRight: '10px'}}
              >
                Ir a Gestión de Usuarios
              </button>
            </div>

            {/* Usuarios pendientes de confirmación */}
            {pendingUsers.length > 0 && (
              <div className="pending-users-box" style={{marginBottom: '30px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 16}}>
                <h3 style={{color: '#b8860b'}}>Usuarios Pendientes de Confirmación</h3>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>DNI</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Función</th>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.dni}</td>
                        <td>{user.nombre}</td>
                        <td>{user.apellido}</td>
                        <td>{user.funcion}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <button className="config-btn" style={{marginRight: 8}} onClick={() => handleConfirmUser(user.id)}>Confirmar</button>
                          <button className="delete-btn" onClick={() => handleDeleteUser(user.id, user.username)}>Rechazar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}
            
            <div className="config-content">
              {loading ? (
                <div className="loading">Cargando usuarios...</div>
              ) : (
                <>
                  <div className="users-summary">
                    <div className="summary-stats">
                      <div className="stat-item">
                        <span className="stat-number">{users.length}</span>
                        <span className="stat-label">Total Usuarios</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{users.filter(u => u.is_active).length}</span>
                        <span className="stat-label">Activos</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{users.filter(u => u.role === 'ADMIN').length}</span>
                        <span className="stat-label">Administradores</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{users.filter(u => u.role === 'ESTABLECIMIENTO').length}</span>
                        <span className="stat-label">Establecimientos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>DNI</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Función</th>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="user-data-cell">
                            <strong>{user.dni || 'Sin DNI'}</strong>
                          </td>
                          <td className="user-data-cell">
                            <strong>{user.nombre || 'Sin nombre'}</strong>
                          </td>
                          <td className="user-data-cell">
                            <strong>{user.apellido || 'Sin apellido'}</strong>
                          </td>
                          <td className="user-data-cell">
                            <strong>{user.funcion || 'Sin función'}</strong>
                          </td>
                          <td className="user-data-cell">
                            <strong>{user.username || 'Sin usuario'}</strong>
                          </td>
                          <td className="user-data-cell">
                            <strong>{user.email || 'Sin email'}</strong>
                          </td>
                          <td>
                            <span className={`role-badge role-${user.role.toLowerCase()}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                              {user.is_active ? 'Activo' : 'Bloqueado'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className={`toggle-btn ${user.is_active ? 'block' : 'unblock'}`}
                                onClick={() => handleToggleStatus(user.id)}
                                title={user.is_active ? 'Bloquear usuario' : 'Desbloquear usuario'}
                              >
                                {user.is_active ? '🔒' : '🔓'}
                              </button>
                              <button
                                className="reset-password-btn"
                                onClick={() => handleResetPassword(user.id, user.username)}
                                title="Blanquear contraseña"
                                disabled={user.role === 'ADMIN' && user.username === '35477889'}
                              >
                                🔑
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                title="Eliminar usuario"
                                disabled={user.role === 'ADMIN' && user.username === '35477889'}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          </div>
        );

      case 'confirmar-usuarios':
        return (
          <div className="config-section">
            <h2>Confirmar Usuarios</h2>
            <p>Gestionar usuarios pendientes de confirmación.</p>
            <div className="config-content">
              <div className="info-box">
                <h3>Funcionalidades disponibles:</h3>
                <ul>
                  <li>Ver usuarios pendientes</li>
                  <li>Confirmar registros</li>
                  <li>Rechazar solicitudes</li>
                  <li>Enviar notificaciones</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'perfiles':
        return (
          <div className="config-section">
            <h2>Gestión de Perfiles</h2>
            <p>Configurar roles y permisos del sistema.</p>
            <div className="config-content">
              <div className="info-box">
                <h3>Funcionalidades disponibles:</h3>
                <ul>
                  <li>Gestionar roles (ADMIN, SUPERVISOR, ESTABLECIMIENTO)</li>
                  <li>Configurar permisos por rol</li>
                  <li>Asignar establecimientos a usuarios</li>
                  <li>Ver logs de actividad</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">CONFIGURACIÓN DEL SISTEMA</h1>
        </div>
        <div className="container">
          <div className="config-panel">
            <div className="config-header">
              <button className="back-btn" onClick={handleBack}>
                ← Volver
              </button>
              <h2>Configuración</h2>
            </div>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracion; 