import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';

function TestConfig() {
  const [configInfo, setConfigInfo] = useState({});
  const [apiTest, setApiTest] = useState({});

  useEffect(() => {
    // Información de configuración
    setConfigInfo({
      apiBaseUrl: API_BASE_URL,
      nodeEnv: process.env.NODE_ENV,
      hostname: window.location.hostname,
      href: window.location.href
    });

    // Probar la API
    const testAPI = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/test`);
        const data = await response.json();
        setApiTest({
          success: true,
          data: data,
          status: response.status
        });
      } catch (error) {
        setApiTest({
          success: false,
          error: error.message
        });
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Test de Configuración</h1>
      
      <h2>📋 Información de Configuración:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(configInfo, null, 2)}
      </pre>

      <h2>🧪 Test de API:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(apiTest, null, 2)}
      </pre>

      <h2>🔗 URLs de Prueba:</h2>
      <ul>
        <li><strong>API Base URL:</strong> {API_BASE_URL}</li>
        <li><strong>Test URL:</strong> {API_BASE_URL}/api/auth/test</li>
        <li><strong>Login URL:</strong> {API_BASE_URL}/api/auth/login</li>
      </ul>
    </div>
  );
}

export default TestConfig; 