const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// 🔧 PÁGINA DE LOGIN SIMPLE
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tablero de Control - Login</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .login-container {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 400px;
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo h1 {
          color: #333;
          margin: 0;
          font-size: 2em;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
        }
        button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }
        button:hover {
          transform: translateY(-2px);
        }
        .error {
          color: #e74c3c;
          text-align: center;
          margin-top: 10px;
          display: none;
        }
        .success {
          color: #27ae60;
          text-align: center;
          margin-top: 10px;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="logo">
          <h1>🏥 Tablero de Control</h1>
        </div>
        <form id="loginForm">
          <div class="form-group">
            <label for="username">Usuario:</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Iniciar Sesión</button>
        </form>
        <div id="error" class="error"></div>
        <div id="success" class="success"></div>
      </div>

      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const errorDiv = document.getElementById('error');
          const successDiv = document.getElementById('success');
          
          errorDiv.style.display = 'none';
          successDiv.style.display = 'none';
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
              successDiv.textContent = '✅ Login exitoso! Redirigiendo...';
              successDiv.style.display = 'block';
              
              // Guardar token
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              
              // Redirigir al dashboard
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);
            } else {
              errorDiv.textContent = data.message || 'Error en el login';
              errorDiv.style.display = 'block';
            }
          } catch (error) {
            errorDiv.textContent = 'Error de conexión: ' + error.message;
            errorDiv.style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// 🔧 PÁGINA DEL DASHBOARD
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard - Tablero de Control</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .welcome {
          background: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        .stat-number {
          font-size: 2em;
          font-weight: bold;
          color: #667eea;
        }
        .logout-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          float: right;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
        <h1>🏥 Dashboard - Tablero de Control</h1>
      </div>
      
      <div class="container">
        <div class="welcome">
          <h2>¡Bienvenido al Sistema!</h2>
          <p>Has iniciado sesión correctamente en el Tablero de Control.</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">25</div>
            <div>Establecimientos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">1,234</div>
            <div>Pacientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">89</div>
            <div>Médicos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">95%</div>
            <div>Eficiencia</div>
          </div>
        </div>
      </div>

      <script>
        // Verificar si hay token
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/';
        }
        
        function logout() {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      </script>
    </body>
    </html>
  `);
});

// 🔧 RUTA DE LOGIN SIMPLE
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('🔑 Login attempt:', { username, password });
  
  if (username === 'admin' && password === 'admin123') {
    console.log('✅ Login exitoso');
    res.json({
      success: true,
      token: 'test-token-123',
      user: {
        id: 1,
        username: 'admin',
        role: 'ADMIN',
        nombre: 'Administrador'
      },
      message: 'Login exitoso'
    });
  } else {
    console.log('❌ Login fallido');
    res.json({
      success: false,
      message: 'Usuario o contraseña incorrectos'
    });
  }
});

// 🔧 RUTA DE PRUEBA
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// 🔧 RUTA DE SALUD
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
}); 