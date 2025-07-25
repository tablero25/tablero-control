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
  const [loading, setLoading] = useState(false);

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

  const handleVolverTablero = () => {
    navigate('/sistema-tablero');
  };

  const fetchUsers = useCallback(async () => {
    clearMessages();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No estás autenticado. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      console.log('[CONFIG] Iniciando fetch de usuarios...');
      console.log('[CONFIG] Token:', token.substring(0, 20) + '...');
      
      const response = await fetch('https://tablero-control-1.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[CONFIG] Respuesta del servidor:', response.status, response.statusText);
      console.log('[CONFIG] Headers de respuesta:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401 || response.status === 403) {
        showError('Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        let errorMessage = 'Error al cargar los usuarios.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('[CONFIG] Error al parsear respuesta de error:', e);
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      console.log('[CONFIG] Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('[CONFIG] Respuesta no-JSON recibida:', textResponse.substring(0, 200));
        throw new Error('El servidor no devolvió JSON válido. Verifica tu conexión.');
      }

      const data = await response.json();
      console.log('[CONFIG] Datos recibidos:', data);
      console.log('[CONFIG] Tipo de datos:', typeof data);
      console.log('[CONFIG] Es array:', Array.isArray(data));

      if (Array.isArray(data)) {
        const confirmedUsers = data.filter(u => u.is_confirmed);
        const pendingUsers = data.filter(u => !u.is_confirmed);
        
        console.log('[CONFIG] Usuarios confirmados:', confirmedUsers.length);
        console.log('[CONFIG] Usuarios pendientes:', pendingUsers.length);
        
        setUsers(confirmedUsers);
        setPendingUsers(pendingUsers);
      } else {
        console.error('[CONFIG] Datos no son un array:', data);
        setUsers([]);
        setPendingUsers([]);
      }

    } catch (err) {
      console.error('[CONFIG] Error en fetchUsers:', err);
      showError(err.message || 'Error al cargar los usuarios.');
      setUsers([]);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const currentPath = location.pathname;
    console.log('[CONFIG] Ruta actual:', currentPath);
    console.log('[CONFIG] fetchUsers disponible:', typeof fetchUsers);
    
    if (currentPath.includes('/sistema-tablero/configuracion/usuarios')) {
      console.log('[CONFIG] Entrando a sección usuarios - llamando fetchUsers()');
      setView('users');
      fetchUsers();
    } else if (currentPath.includes('/sistema-tablero/configuracion/confirmar')) {
      console.log('[CONFIG] Entrando a sección confirmar - llamando fetchUsers()');
      setView('confirm');
      fetchUsers();
    } else if (currentPath.includes('/sistema-tablero/configuracion/perfiles')) {
      setView('profiles');
    } else {
      setView('main');
    }
  }, [location, fetchUsers]);

  const handleNavigate = (path) => {
    clearMessages();
    navigate(`/sistema-tablero/configuracion/${path}`);
  };

  const handleAction = async (actionFn, successMessage) => {
    clearMessages();
    setLoading(true);
    
    try {
      const result = await actionFn();
      if (result.success) {
        showSuccess(successMessage);
        fetchUsers(); // Recargar la lista de usuarios
      } else {
        showError(result.message || 'Ocurrió un error.');
      }
    } catch (err) {
      console.error('[CONFIG] Error en acción:', err);
      showError(err.message || 'Error en la operación.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUser = (userId) => {
    if (window.confirm('¿Estás seguro de que deseas confirmar a este usuario?')) {
      handleAction(async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://tablero-control-1.onrender.com/api/users/confirm/${userId}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al confirmar usuario');
        }
        
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
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar usuario');
        }
        
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
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error al ${action} usuario`);
        }
        
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
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al blanquear contraseña');
        }
        
        return response.json();
      }, 'Contraseña blanqueada exitosamente. El usuario recibirá un correo con la nueva clave.');
    }
  };

  const handleResetAllUsers = () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar TODOS los usuarios y crear uno nuevo con usuario "123" y contraseña "123"? Esta acción no se puede deshacer.')) {
      return;
    }

    handleAction(
      async () => {
        const response = await fetch('https://tablero-control-1.onrender.com/api/reset-users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al resetear usuarios');
        }

        return await response.json();
      },
      'Usuarios reseteados. Nuevo usuario creado: 123/123'
    ).then(() => {
      // Recargar la lista de usuarios después del reset
      setTimeout(() => {
        fetchUsers();
      }, 1000);
    });
  };

  const renderUserTable = (userList, isPending) => (
    <div className="user-table-container">
      {loading && (
        <div className="loading-message">
          <p>Cargando usuarios...</p>
        </div>
      )}
      
      {!loading && userList.length === 0 ? (
        <div className="no-users-message">
          {isPending ? 'No hay usuarios pendientes de confirmación.' : 'No hay usuarios registrados.'}
        </div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Nombre y Apellido</th>
              <th>Email</th>
              <th>Establecimiento</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(user => (
              <tr key={user.id} className={user.is_blocked ? 'blocked-user' : ''}>
                <td>{user.nombre} {user.apellido}</td>
                <td>{user.email}</td>
                <td>{user.establecimiento || 'No especificado'}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.is_blocked ? (
                    <span className="status-badge blocked">Bloqueado</span>
                  ) : (
                    <span className="status-badge active">Activo</span>
                  )}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {isPending ? (
                      <button 
                        className="action-btn confirm" 
                        onClick={() => handleConfirmUser(user.id)}
                        title="Confirmar usuario"
                        disabled={loading}
                      >
                        <i className="fas fa-check"></i> Confirmar
                      </button>
                    ) : (
                      <>
                        <button 
                          className={`action-btn ${user.is_blocked ? 'unblock' : 'block'}`} 
                          onClick={() => handleToggleBlockUser(user.id, user.is_blocked)}
                          title={user.is_blocked ? 'Desbloquear usuario' : 'Bloquear usuario'}
                          disabled={loading}
                        >
                          <i className={`fas ${user.is_blocked ? 'fa-unlock' : 'fa-lock'}`}></i>
                        </button>
                        <button 
                          className="action-btn reset" 
                          onClick={() => handleResetPassword(user.id)}
                          title="Restablecer contraseña"
                          disabled={loading}
                        >
                          <i className="fas fa-key"></i>
                        </button>
                      </>
                    )}
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDeleteUser(user.id)}
                      title="Eliminar usuario"
                      disabled={loading}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>Panel de Configuración</h1>
        <div className="config-header-buttons">
          <button className="tablero-btn" onClick={handleVolverTablero}>
            📊 Tablero
          </button>
          {view !== 'main' && (
            <button className="back-btn" onClick={() => handleNavigate('')}>← Volver</button>
          )}
        </div>
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
          <div className="user-management-header">
            <h2>Usuarios Registrados</h2>
            <button 
              className="reset-all-btn" 
              onClick={handleResetAllUsers}
              disabled={loading}
              title="Eliminar todos los usuarios y crear usuario 123"
            >
              🔄 Resetear Todos los Usuarios
            </button>
          </div>
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