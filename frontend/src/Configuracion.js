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