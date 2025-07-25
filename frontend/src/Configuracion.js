import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Configuracion.css'; // Asegúrate de crear este archivo para los estilos

// Componente para los mensajes de feedback (éxito/error)
const FeedbackMessage = ({ message, type, onDismiss }) => {
  if (!message) return null;

  return (
    <div className={`feedback-message ${type}-msg`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="dismiss-btn">×</button>
    </div>
  );
};

const Configuracion = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState('main'); // main, users, confirm, profiles
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000); // Auto-dismiss after 5 seconds
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000); // Auto-dismiss after 5 seconds
  };

  const fetchUsers = useCallback(async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No estás autenticado. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      const response = await fetch('https://tablero-control-1.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        showError('Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar los usuarios.');
      }

      const data = await response.json();
      setUsers(data.filter(u => u.is_confirmed));
      setPendingUsers(data.filter(u => !u.is_confirmed));

    } catch (err) {
      showError(err.message);
    }
  }, [navigate]);

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes('/usuarios')) {
      setView('users');
      fetchUsers();
    } else if (currentPath.includes('/confirmar')) {
        setView('confirm');
        fetchUsers();
    } else if (currentPath.includes('/perfiles')) {
      setView('profiles');
    } else {
      setView('main');
    }
  }, [location, fetchUsers]);

  const handleNavigate = (path) => {
    clearMessages();
    navigate(`/configuracion/${path}`);
  };

  const handleAction = async (actionFn, successMessage) => {
    clearMessages();
    try {
      const result = await actionFn();
      if (result.success) {
        showSuccess(successMessage);
        fetchUsers(); // Recargar la lista de usuarios
      } else {
        showError(result.message || 'Ocurrió un error.');
      }
    } catch (err) {
      showError(err.message || 'Error en la operación.');
    }
  };

  const handleConfirmUser = (userId) => {
    if (window.confirm('¿Estás seguro de que deseas confirmar a este usuario?')) {
        handleAction(async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tablero-control-1.onrender.com/api/users/confirm/${userId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.json();
        }, 'Usuario confirmado exitosamente.');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este usuario? Esta acción es irreversible.')) {
        handleAction(async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tablero-control-1.onrender.com/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.json();
        }, 'Usuario eliminado exitosamente.');
    }
  };

  const handleToggleBlockUser = (userId, isBlocked) => {
    const action = isBlocked ? 'desbloquear' : 'bloquear';
    if (window.confirm(`¿Estás seguro de que deseas ${action} a este usuario?`)) {
        handleAction(async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tablero-control-1.onrender.com/api/users/block/${userId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.json();
        }, `Usuario ${action} con éxito.`);
    }
  };

  const handleResetPassword = (userId) => {
    if (window.confirm('¿Estás seguro de que deseas blanquear la contraseña de este usuario? Se enviará una nueva contraseña a su correo.')) {
        handleAction(async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tablero-control-1.onrender.com/api/users/reset-password/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.json();
        }, 'Contraseña blanqueada exitosamente. El usuario recibirá un correo con la nueva clave.');
    }
  };

  const renderUserTable = (userList, isPending) => (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre y Apellido</th>
            <th>Email</th>
            <th>Establecimiento</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {userList.map(user => (
            <tr key={user.id} className={user.is_blocked ? 'blocked-user' : ''}>
              <td>{user.nombre} {user.apellido}</td>
              <td>{user.email}</td>
              <td>{user.establecimiento}</td>
              <td>{user.role}</td>
              <td className="actions-cell">
                {isPending ? (
                  <button className="action-btn confirm" onClick={() => handleConfirmUser(user.id)}>Confirmar</button>
                ) : (
                  <>
                    <button className="action-btn block" onClick={() => handleToggleBlockUser(user.id, user.is_blocked)}>
                      {user.is_blocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                    <button className="action-btn reset" onClick={() => handleResetPassword(user.id)}>Blanquear</button>
                  </>
                )}
                 <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>Panel de Configuración</h1>
        {view !== 'main' && (
          <button className="back-btn" onClick={() => handleNavigate('')}>← Volver</button>
        )}
      </div>

      <FeedbackMessage message={error} type="error" onDismiss={() => setError('')} />
      <FeedbackMessage message={success} type="success" onDismiss={() => setSuccess('')} />

      {view === 'main' && (
        <div className="config-main-menu">
          <div className="config-option" onClick={() => handleNavigate('usuarios')}>
            <h2>Gestión de Usuarios</h2>
            <p>Administra usuarios existentes, confirma nuevos registros y gestiona permisos.</p>
          </div>
          <div className="config-option" onClick={() => handleNavigate('perfiles')}>
            <h2>Gestión de Perfiles</h2>
            <p>Define los roles y permisos para los diferentes tipos de usuario en el sistema.</p>
          </div>
        </div>
      )}

      {view === 'users' && (
        <div className="user-management-section">
          <h2>Usuarios Registrados</h2>
          {users.length > 0 ? renderUserTable(users, false) : <p>No hay usuarios registrados o confirmados.</p>}
          
          <hr style={{margin: '40px 0'}} />

          <h2>Usuarios Pendientes de Confirmación</h2>
          {pendingUsers.length > 0 ? renderUserTable(pendingUsers, true) : <p>No hay usuarios pendientes de confirmación.</p>}
        </div>
      )}

      {view === 'profiles' && (
        <div className="profiles-section">
          <h2>Gestión de Perfiles</h2>
          <p>Esta sección está en desarrollo. Aquí podrás configurar los roles y permisos del sistema.</p>
        </div>
      )}
    </div>
  );
};

export default Configuracion;

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
  const navigate = useNavigate();
  const location = useLocation();
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
      const response = await fetchWithAuth(`https://tablero-control-1.onrender.com/api/auth/users/${userId}/toggle-status`, {
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
      const response = await fetchWithAuth(`https://tablero-control-1.onrender.com/api/auth/users/${userId}`, {
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

  // Blanquear contraseña
  const handleResetPassword = async (userId, username) => {
    if (!window.confirm(`¿Está seguro que desea blanquear la contraseña del usuario ${username}?`)) {
      return;
    }

    try {
      const response = await fetchWithAuth(`https://tablero-control-1.onrender.com/api/auth/users/${userId}/reset-password`, {
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
      const response = await fetchWithAuth(`https://tablero-control-1.onrender.com/api/auth/users/${userId}/confirm`, {
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