import React, { useState, useEffect } from 'react';
import './Configuracion.css';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUsers();
    }
  }, [activeTab]);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users || []);
          setPendingUsers(data.pendingUsers || []);
        } else {
          showMessage('Error al cargar usuarios', 'error');
        }
      } else {
        showMessage('Error al cargar usuarios', 'error');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      showMessage('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/confirm/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showMessage('Usuario confirmado exitosamente', 'success');
        loadUsers();
      } else {
        showMessage('Error al confirmar usuario', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  const toggleUserBlock = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/block/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_blocked: isBlocked })
      });

      if (response.ok) {
        showMessage(`Usuario ${isBlocked ? 'bloqueado' : 'desbloqueado'} exitosamente`, 'success');
        loadUsers();
      } else {
        showMessage('Error al cambiar estado del usuario', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  const resetPassword = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/reset-password/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showMessage('Contraseña reseteada exitosamente', 'success');
      } else {
        showMessage('Error al resetear contraseña', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showMessage('Usuario eliminado exitosamente', 'success');
        loadUsers();
      } else {
        showMessage('Error al eliminar usuario', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  const renderUsers = () => (
    <div className="config-content">
      <div className="users-section">
        <h3>👥 Gestión de Usuarios</h3>
        
        {loading ? (
          <div className="loading">Cargando usuarios...</div>
        ) : (
          <>
            {/* Usuarios Confirmados */}
            <div className="users-group">
              <h4>✅ Usuarios Activos ({users.length})</h4>
              {users.length === 0 ? (
                <p className="no-users">No hay usuarios activos</p>
              ) : (
                <div className="users-grid">
                  {users.map(user => (
                    <div key={user.id} className="user-card">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <h5>{user.nombre} {user.apellido}</h5>
                          <p className="user-email">{user.email}</p>
                          <p className="user-role">{user.role || 'USER'}</p>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button 
                          onClick={() => toggleUserBlock(user.id, user.is_active)}
                          className={`btn-action ${user.is_active ? 'btn-block' : 'btn-unblock'}`}
                        >
                          {user.is_active ? '🔒 Bloquear' : '🔓 Desbloquear'}
                        </button>
                        <button 
                          onClick={() => resetPassword(user.id)}
                          className="btn-action btn-reset"
                        >
                          🔑 Resetear
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="btn-action btn-delete"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Usuarios Pendientes */}
            {pendingUsers.length > 0 && (
              <div className="users-group">
                <h4>⏳ Usuarios Pendientes ({pendingUsers.length})</h4>
                <div className="users-grid">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="user-card pending">
                      <div className="user-info">
                        <div className="user-avatar pending">
                          {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <h5>{user.nombre} {user.apellido}</h5>
                          <p className="user-email">{user.email}</p>
                          <p className="user-role">{user.role || 'USER'}</p>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button 
                          onClick={() => confirmUser(user.id)}
                          className="btn-action btn-confirm"
                        >
                          ✅ Confirmar
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="btn-action btn-delete"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="config-content">
      <div className="profile-section">
        <h3>👤 Mi Perfil</h3>
        <div className="profile-card">
          <div className="profile-avatar">
            <span>LT</span>
          </div>
          <div className="profile-info">
            <h4>lucio tapia</h4>
            <p className="profile-email">luxiot23@gmail.com</p>
            <p className="profile-role">Administrador</p>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn-profile">
            ✏️ Editar Perfil
          </button>
          <button className="btn-profile">
            🔑 Cambiar Contraseña
          </button>
          <button className="btn-profile">
            ⚙️ Preferencias
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="configuracion-container">
      {/* Header */}
      <div className="config-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon">⚙️</span>
            <h2>Configuración</h2>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="config-tabs">
        <button 
          className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          <span className="tab-icon">👥</span>
          Usuarios
        </button>
        <button 
          className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfil')}
        >
          <span className="tab-icon">👤</span>
          Perfil
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Content */}
      <div className="config-main">
        {activeTab === 'usuarios' ? renderUsers() : renderProfile()}
      </div>
    </div>
  );
};

export default Configuracion; 