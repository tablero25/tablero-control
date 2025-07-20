import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ConfirmUser from './ConfirmUser';
import ChangePassword from './ChangePassword';
import Configuracion from './Configuracion';
import RolesPage from './RolesPage';
import TableroPrincipal from './TableroPrincipal';
import logoSDO from './logoo.png';

// URL DIRECTA DE PRODUCCIÓN
const API_URL = 'https://tablero-control-1.onrender.com';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Verificando autenticación con URL:', `${API_URL}/api/auth/profile`);
      
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
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
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            isAuthenticated ? 
              <Navigate to="/sistema-tablero" replace /> : 
              <Login onLogin={handleLogin} />
          } />
          
          <Route path="/registrarse" element={
            isAuthenticated ? 
              <Navigate to="/sistema-tablero" replace /> : 
              <Register />
          } />
          
          <Route path="/confirmar" element={<ConfirmUser />} />
          
          <Route path="/change-password" element={
            isAuthenticated ? 
              <ChangePassword /> : 
              <Navigate to="/" replace />
          } />
          
          <Route path="/configuracion" element={
            isAuthenticated ? 
              <Configuracion /> : 
              <Navigate to="/" replace />
          } />
          
          <Route path="/roles" element={
            isAuthenticated ? 
              <RolesPage /> : 
              <Navigate to="/" replace />
          } />
          
          <Route path="/sistema-tablero" element={
            isAuthenticated ? 
              <TableroPrincipal user={user} onLogout={handleLogout} /> : 
              <Navigate to="/" replace />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
