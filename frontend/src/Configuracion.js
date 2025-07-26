import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Configuracion.css';

const Configuracion = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Estados para diferentes secciones
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/sistema-tablero');
  };

  // Cargar usuarios
  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('No estás autenticado', 'error');
        navigate('/login');
        return;
      }

      const response = await fetch('https://tablero-control-1.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        showMessage('Sesión expirada', 'error');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setPendingUsers(data.pendingUsers || []);
      } else {
        showMessage(data.error || 'Error al cargar usuarios', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Confirmar usuario
  const confirmUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tablero-control-1.onrender.com/api/users/confirm/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showMessage('Usuario confirmado exitosamente', 'success');
        loadUsers(); // Recargar lista
      } else {
        showMessage('Error al confirmar usuario', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  // Bloquear/desbloquear usuario
  const toggleUserBlock = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tablero-control-1.onrender.com/api/users/block/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_blocked: isBlocked })
      });

      if (response.ok) {
        showMessage(`Usuario ${isBlocked ? 'bloqueado' : 'desbloqueado'} exitosamente`, 'success');
        loadUsers(); // Recargar lista
      } else {
        showMessage('Error al cambiar estado del usuario', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  // Resetear contraseña
  const resetPassword = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tablero-control-1.onrender.com/api/users/reset-password/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showMessage(`Contraseña reseteada. Nueva contraseña: ${data.tempPassword}`, 'success');
        loadUsers(); // Recargar lista
      } else {
        showMessage('Error al resetear contraseña', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tablero-control-1.onrender.com/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showMessage('Usuario eliminado exitosamente', 'success');
        loadUsers(); // Recargar lista
      } else {
        showMessage('Error al eliminar usuario', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const renderDashboard = () => (
    <div className="config-dashboard">
      <h2>🎛️ Panel de Configuración</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => setActiveTab('users')}>
          <h3>👥 Gestión de Usuarios</h3>
          <p>Administrar usuarios del sistema</p>
        </div>
        <div className="dashboard-card">
          <h3>⚙️ Configuración del Sistema</h3>
          <p>Configuraciones generales</p>
        </div>
        <div className="dashboard-card">
          <h3>📊 Reportes</h3>
          <p>Generar reportes del sistema</p>
        </div>
        <div className="dashboard-card">
          <h3>🔒 Seguridad</h3>
          <p>Configuraciones de seguridad</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="config-users">
      <h2>👥 Gestión de Usuarios</h2>
      
      {loading && <div className="loading">Cargando usuarios...</div>}
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Usuarios pendientes */}
      {pendingUsers.length > 0 && (
        <div className="users-section">
          <h3>⏳ Usuarios Pendientes de Confirmación</h3>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.nombre} {user.apellido}</td>
                    <td>
                      <button 
                        onClick={() => confirmUser(user.id)}
                        className="btn-confirm"
                      >
                        ✅ Confirmar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Usuarios activos */}
      <div className="users-section">
        <h3>✅ Usuarios Activos</h3>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.nombre} {user.apellido}</td>
                  <td>{user.role || 'USER'}</td>
                  <td>
                    <span className={`status ${user.is_active ? 'active' : 'blocked'}`}>
                      {user.is_active ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => toggleUserBlock(user.id, !user.is_active)}
                        className={user.is_active ? 'btn-block' : 'btn-unblock'}
                      >
                        {user.is_active ? '🚫 Bloquear' : '✅ Desbloquear'}
                      </button>
                      <button 
                        onClick={() => resetPassword(user.id)}
                        className="btn-reset"
                      >
                        🔑 Reset
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="btn-delete"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="configuracion-container">
      <div className="config-header">
        <h1>⚙️ Configuración del Sistema</h1>
        <div className="header-actions">
          <button onClick={handleBackToDashboard} className="btn-secondary">
            🏠 Volver al Tablero
          </button>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="config-nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          🎛️ Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuarios
        </button>
      </div>

      <div className="config-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
      </div>
    </div>
  );
};

export default Configuracion; 