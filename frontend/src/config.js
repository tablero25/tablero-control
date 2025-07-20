// Configuración del backend - Forzar URL de producción
const API_BASE_URL = 'https://tablero-control-1.onrender.com';

// Timestamp para forzar recarga de cache
const CACHE_BUSTER = Date.now();

// Log para debugging
console.log('🌐 API_BASE_URL configurado como:', API_BASE_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 Hostname:', window.location.hostname);
console.log('🕒 Cache buster:', CACHE_BUSTER);

// Función para obtener URL con cache buster
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}?v=${CACHE_BUSTER}`;
};

export default API_BASE_URL; 