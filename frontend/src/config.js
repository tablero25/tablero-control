// Configuración del backend
let API_BASE_URL;

// Detectar el entorno de manera más robusta
if (process.env.NODE_ENV === 'production' || 
    window.location.hostname !== 'localhost' || 
    window.location.hostname !== '127.0.0.1') {
  // En producción o cuando no es localhost
  API_BASE_URL = 'https://tablero-control-1.onrender.com';
} else {
  // En desarrollo local
  API_BASE_URL = 'http://localhost:5001';
}

// Log para debugging
console.log('🌐 API_BASE_URL configurado como:', API_BASE_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 Hostname:', window.location.hostname);

export default API_BASE_URL; 