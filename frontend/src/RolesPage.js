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

function RolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: '',
    establecimientos: []
  });

  // Cargar usuarios
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth('http://localhost:5001/api/auth/users');
      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo usuarios activos (confirmados) y procesar datos
        const processedUsers = data.users
          .filter(user => user.is_active === true) // Solo usuarios confirmados
          .map(user => ({
            id: user.id,
            username: user.username || '',
            email: user.email || '',
            dni: user.dni || '',
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            funcion: user.funcion || '',
            role: user.role || '',
            is_active: user.is_active !== undefined ? user.is_active : true,
            created_at: user.created_at || '',
            establecimientos_count: user.establecimientos_count || 0
          }));
        
        console.log('Usuarios confirmados cargados:', processedUsers);
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

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role || '',
      establecimientos: [] // Aquí se cargarían los establecimientos del usuario
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    // Validaciones según el rol
    if (editForm.role === 'ESTABLECIMIENTO' && editForm.establecimientos.length !== 1) {
      setError('Los usuarios de establecimiento deben tener exactamente un establecimiento asignado');
      return;
    }

    if (editForm.role === 'JEFE_ZONA' && editForm.establecimientos.length === 0) {
      setError('Los jefes de zona deben tener al menos un establecimiento asignado');
      return;
    }

    try {
      const response = await fetchWithAuth(`http://localhost:5001/api/auth/users/${selectedUser.id}/update-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: editForm.role,
          establecimientos: editForm.establecimientos
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        setShowEditModal(false);
        loadUsers(); // Recargar lista
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setEditForm({ role: '', establecimientos: [] });
    setError('');
  };

  const handleRoleChange = (newRole) => {
    setEditForm(prev => {
      let newEstablecimientos = [...prev.establecimientos];
      
      // Lógica según el rol seleccionado
      if (newRole === 'ADMIN') {
        // ADMIN ve todo automáticamente
        newEstablecimientos = [];
      } else if (newRole === 'SUPERVISOR') {
        // SUPERVISOR ve todo pero no puede subir archivos
        newEstablecimientos = [];
      } else if (newRole === 'ESTABLECIMIENTO') {
        // ESTABLECIMIENTO debe seleccionar exactamente 1
        newEstablecimientos = newEstablecimientos.slice(0, 1);
      } else if (newRole === 'JEFE_ZONA') {
        // JEFE_ZONA puede seleccionar múltiples
        // Mantener los que ya están seleccionados
      }
      
      return {
        role: newRole,
        establecimientos: newEstablecimientos
      };
    });
  };

  const handleSelectAll = () => {
    setEditForm(prev => ({
      ...prev,
      establecimientos: [...ESTABLECIMIENTOS]
    }));
  };

  const handleEstablecimientoChange = (establecimiento, checked) => {
    setEditForm(prev => {
      let newEstablecimientos = [...prev.establecimientos];
      
      if (checked) {
        // Agregar establecimiento
        if (prev.role === 'ESTABLECIMIENTO' && newEstablecimientos.length >= 1) {
          // Para ESTABLECIMIENTO, solo permitir 1
          newEstablecimientos = [establecimiento];
        } else {
          newEstablecimientos.push(establecimiento);
        }
      } else {
        // Remover establecimiento
        newEstablecimientos = newEstablecimientos.filter(e => e !== establecimiento);
      }
      
      return {
        ...prev,
        establecimientos: newEstablecimientos
      };
    });
  };

  const ROLES = ['ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA'];
  const ESTABLECIMIENTOS = [
    '47 Materno Infantil', '40 San Bernardo', '55 Papa Francisco', '41 Señor Del Milagro',
    '43 Oñativia', '42 Ragone', '45 P.N.A. zona norte', '56 P.N.A. zona sur',
    'Centro de Rehabilitación', 'Oncologia', 'Adicciones', 'CUCAI', 'Samec',
    '1 Colonia Sta. Rosa', '2 Pichanal', '3 Aguaray', '4 Morillo', '7 P. Salvador Maza',
    '8 Sta. Victoria Este', '9 Embarcación', '11 Oran', '12 Tartagal', '13 Rivadavia',
    '28 Gral. Enrique Mosconi', '31 Hipólito Yrigoyen', '44 Alto la Sierra', '49 Urundel', '51 La Unión',
    '14 Las Lajitas', '15 J. V. González', '16 El Quebrachal', '17 El Galpón',
    '18 Rosario de la Frontera', '19 Metan', '21 El Tala', '22 Gral. Güemes',
    '23 Apolinario Saravia', '38 El Potrero', '5 Sta. Victoria Oeste', '6 Iruya', '10 Nazareno',
    '24 Cafayate', '25 San Carlos', '26 Molinos', '27 Cachi', '29 San Antonio de los Cobres',
    '30 Cerrillos', '32 Rosario de Lerma', '33 Chicoana', '34 El Carril', '35 Cnel. Moldes',
    '36 La Viña', '37 Guachipas', '39 La Caldera', '46 Campo Quijano', '48 Seclantas',
    '50 La Merced', '52 La Poma', '53 Angastaco'
  ];

  const getRoleDescription = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Acceso completo a todo el sistema';
      case 'SUPERVISOR':
        return 'Puede ver todo pero no subir archivos';
      case 'ESTABLECIMIENTO':
        return 'Acceso a un establecimiento específico';
      case 'JEFE_ZONA':
        return 'Acceso a múltiples establecimientos';
      default:
        return '';
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">GESTIÓN DE ROLES</h1>
        </div>
        <div className="container">
          <div className="config-panel">
            <div className="config-header">
              <h2>Gestión de Roles y Establecimientos</h2>
            </div>
            
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
                        <span className="stat-number">{users.filter(u => u.role === 'ADMIN').length}</span>
                        <span className="stat-label">Administradores</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{users.filter(u => u.role === 'ESTABLECIMIENTO').length}</span>
                        <span className="stat-label">Establecimientos</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{users.filter(u => u.role === 'JEFE_ZONA').length}</span>
                        <span className="stat-label">Jefes de Zona</span>
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
                              <span className={`role-badge role-${(user.role || 'sin-rol').toLowerCase()}`}>
                                {user.role || 'Sin Rol'}
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
                                  className="edit-btn"
                                  onClick={() => handleEditUser(user)}
                                  title="Editar rol y establecimientos"
                                >
                                  ✏️
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
              {message && <div className="success-msg">{message}</div>}
              {error && <div className="error-msg">{error}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Usuario: {selectedUser.nombre} {selectedUser.apellido}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Rol:</label>
                <select 
                  value={editForm.role} 
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="form-control"
                >
                  <option value="">Seleccionar rol</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {editForm.role && (
                  <small style={{color: '#666', marginTop: '4px', display: 'block'}}>
                    {getRoleDescription(editForm.role)}
                  </small>
                )}
              </div>
              
              {(editForm.role === 'ESTABLECIMIENTO' || editForm.role === 'JEFE_ZONA') && (
                <div className="form-group">
                  <label>
                    Establecimientos:
                    {editForm.role === 'ESTABLECIMIENTO' && (
                      <span style={{color: '#dc3545', fontSize: '0.9rem'}}> (Seleccionar exactamente 1)</span>
                    )}
                    {editForm.role === 'JEFE_ZONA' && (
                      <span style={{color: '#28a745', fontSize: '0.9rem'}}> (Seleccionar los necesarios)</span>
                    )}
                  </label>
                  
                  <div style={{marginBottom: '10px'}}>
                    <button 
                      type="button" 
                      className="config-btn" 
                      onClick={handleSelectAll}
                      style={{fontSize: '0.9rem', padding: '6px 12px'}}
                    >
                      Seleccionar Todo
                    </button>
                  </div>
                  
                  <div className="establecimientos-list">
                    {ESTABLECIMIENTOS.map(est => (
                      <label key={est} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={editForm.establecimientos.includes(est)}
                          onChange={(e) => handleEstablecimientoChange(est, e.target.checked)}
                        />
                        {est}
                      </label>
                    ))}
                  </div>
                  
                  {editForm.role === 'ESTABLECIMIENTO' && editForm.establecimientos.length > 1 && (
                    <div style={{color: '#dc3545', fontSize: '0.9rem', marginTop: '8px'}}>
                      ⚠️ Los usuarios de establecimiento solo pueden tener un establecimiento asignado
                    </div>
                  )}
                </div>
              )}
              
              {(editForm.role === 'ADMIN' || editForm.role === 'SUPERVISOR') && (
                <div className="info-box" style={{marginTop: '16px'}}>
                  <strong>{editForm.role === 'ADMIN' ? 'Administrador' : 'Supervisor'}:</strong> 
                  {editForm.role === 'ADMIN' 
                    ? ' Tiene acceso completo a todos los establecimientos y funcionalidades.'
                    : ' Puede ver todos los establecimientos pero no puede subir archivos.'
                  }
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>Cancelar</button>
              <button className="config-btn" onClick={handleSaveUser}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPage; 