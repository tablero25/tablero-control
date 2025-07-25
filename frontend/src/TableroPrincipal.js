import React from 'react';
import logoSDO from './logoo.png';

function TableroPrincipal({ user, onLogout }) {
  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">TABLERO S/D/O</h1>
        </div>
        <div className="container">
          <div className="dashboard-panel">
            <div className="dashboard-header">
              <h2>Bienvenido al Sistema de Tableros</h2>
              {user && (
                <div className="user-info">
                  <p><strong>Usuario:</strong> {user.username}</p>
                  <p><strong>Rol:</strong> {user.role}</p>
                </div>
              )}
            </div>
            
            <div className="dashboard-content">
              <div className="info-box">
                <h3>🎯 Sistema en Desarrollo</h3>
                <p>El sistema principal está siendo configurado. Por favor, use las opciones de navegación disponibles.</p>
              </div>
              
              <div className="dashboard-actions">
                {user && user.role === 'ADMIN' && (
  <>
    <button onClick={() => window.location.href = '/configuracion'} className="dashboard-btn">
      ⚙️ Configuración
    </button>
    <button onClick={() => window.location.href = '/roles'} className="dashboard-btn">
      👥 Gestión de Roles
    </button>
  </>
) }
                <button onClick={() => window.location.href = '/change-password'} className="dashboard-btn">
                  🔑 Cambiar Contraseña
                </button>
                <button onClick={onLogout} className="logout-btn">
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableroPrincipal; 