import React, { useState, useEffect } from 'react';
import logoSDO from './logoo.png';

function UpdateDatabase() {
  const [status, setStatus] = useState('Iniciando actualización...');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    updateDatabase();
  }, []);

  const updateDatabase = async () => {
    try {
      setStatus('Conectando a la base de datos...');
      
      // Llamar al endpoint de actualización
      const response = await fetch('https://tablero-control-1.onrender.com/api/auth/update-database', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('✅ Base de datos actualizada exitosamente');
        setResult(data);
      } else {
        setStatus('❌ Error en la actualización');
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setStatus('❌ Error de conexión');
      setError(err.message);
    }
  };

  return (
    <div className="App">
      <div className="tablero-bg">
        <div className="logo-sdo-banner">
          <img src={logoSDO} alt="Logo SDO" />
          <h1 className="banner-title">TABLERO S/D/O</h1>
        </div>
        <div className="container">
          <div className="login-form" style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Actualización de Base de Datos</h2>
            
            <div style={{ margin: '20px 0' }}>
              <p style={{ fontSize: '16px', color: '#333' }}>{status}</p>
            </div>

            {result && (
              <div style={{ 
                background: '#e8f5e8', 
                border: '1px solid #4caf50', 
                borderRadius: '5px', 
                padding: '20px', 
                margin: '20px 0',
                textAlign: 'left'
              }}>
                <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✅ Actualización Completada</h3>
                <p><strong>Mensaje:</strong> {result.message}</p>
                <p><strong>Detalles:</strong></p>
                <ul>
                  <li>Columna confirmation_token: {result.details.confirmation_token_added ? 'Agregada' : 'Ya existía'}</li>
                  <li>Columna is_active: {result.details.is_active_added ? 'Agregada' : 'Ya existía'}</li>
                  <li>Usuarios actualizados: {result.details.users_updated}</li>
                </ul>
              </div>
            )}

            {error && (
              <div style={{ 
                background: '#ffebee', 
                border: '1px solid #f44336', 
                borderRadius: '5px', 
                padding: '20px', 
                margin: '20px 0' 
              }}>
                <h3 style={{ color: '#c62828', marginTop: 0 }}>❌ Error</h3>
                <p>{error}</p>
              </div>
            )}

            <div style={{ marginTop: '30px' }}>
              <button 
                onClick={() => window.location.href = '/registrarse'}
                style={{
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginRight: '10px'
                }}
              >
                Ir al Registro
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Ir al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateDatabase; 