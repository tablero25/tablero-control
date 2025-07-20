const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware básico
app.use(cors());
app.use(express.json());

// 🔧 PÁGINA PRINCIPAL ULTRA-SIMPLE
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sistema de Control</title>
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
        .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
        input, button { padding: 10px; margin: 10px; width: 200px; }
        button { background: #007bff; color: white; border: none; cursor: pointer; }
        .error { color: red; }
        .success { color: green; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏥 Sistema de Control</h1>
        <h2>Login</h2>
        <input type="text" id="user" placeholder="Usuario" value="admin">
        <br>
        <input type="password" id="pass" placeholder="Contraseña" value="admin123">
        <br>
        <button onclick="login()">Entrar</button>
        <div id="result"></div>
      </div>
      
      <script>
        async function login() {
          const user = document.getElementById('user').value;
          const pass = document.getElementById('pass').value;
          const result = document.getElementById('result');
          
          try {
            const response = await fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user, password: pass })
            });
            
            const data = await response.json();
            
            if (data.success) {
              result.innerHTML = '<div class="success">✅ Login exitoso! Redirigiendo...</div>';
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);
            } else {
              result.innerHTML = '<div class="error">❌ ' + data.message + '</div>';
            }
          } catch (error) {
            result.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// 🔧 LOGIN SIMPLE
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, message: 'Login correcto' });
  } else {
    res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
  }
});

// 🔧 DASHBOARD SIMPLE
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard</title>
      <style>
        body { font-family: Arial; margin: 0; padding: 20px; background: #f0f0f0; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { max-width: 800px; margin: 20px auto; background: white; padding: 20px; border-radius: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
        .logout { background: #dc3545; color: white; border: none; padding: 10px 20px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="logout" onclick="logout()">Cerrar Sesión</button>
        <h1>🏥 Dashboard - Sistema de Control</h1>
      </div>
      
      <div class="content">
        <h2>¡Bienvenido al Sistema!</h2>
        <p>Has iniciado sesión correctamente.</p>
        
        <div class="stats">
          <div class="stat">
            <h3>25</h3>
            <p>Establecimientos</p>
          </div>
          <div class="stat">
            <h3>1,234</h3>
            <p>Pacientes</p>
          </div>
          <div class="stat">
            <h3>89</h3>
            <p>Médicos</p>
          </div>
          <div class="stat">
            <h3>95%</h3>
            <p>Eficiencia</p>
          </div>
        </div>
        
        <h3>Funcionalidades disponibles:</h3>
        <ul>
          <li>📊 Ver estadísticas</li>
          <li>👥 Gestionar usuarios</li>
          <li>🏥 Administrar establecimientos</li>
          <li>📈 Generar reportes</li>
        </ul>
      </div>
      
      <script>
        function logout() {
          window.location.href = '/';
        }
      </script>
    </body>
    </html>
  `);
});

// 🔧 RUTA DE PRUEBA
app.get('/test', (req, res) => {
  res.json({ message: 'Sistema funcionando', timestamp: new Date().toISOString() });
});

// 🔧 RUTA DE SALUD
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema funcionando' });
});

app.listen(PORT, () => {
  console.log('🚀 Servidor funcionando en puerto', PORT);
}); 