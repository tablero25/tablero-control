// Configuración del backend - Forzar URL de producción
const API_BASE_URL = 'https://tablero-control-1.onrender.com';

// Log para debugging
console.log('🌐 API_BASE_URL configurado como:', API_BASE_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 Hostname:', window.location.hostname);

export default API_BASE_URL; 