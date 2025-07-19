// Configuración del backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tablero-control-1.onrender.com' 
  : 'http://localhost:5001';

export default API_BASE_URL; 