// Configuración del backend - Usar configuración global establecida por index.html
const API_BASE_URL = window.API_BASE_URL || 'https://tablero-control-1.onrender.com';

// Timestamp para forzar recarga de cache
const CACHE_BUSTER = Date.now();

// Log para debugging
console.log('🌐 config.js - API_BASE_URL configurado como:', API_BASE_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 Hostname:', window.location.hostname);
console.log('🕒 Cache buster:', CACHE_BUSTER);
console.log('🚀 Entorno detectado:', window.location.hostname === 'localhost' ? 'DESARROLLO' : 'PRODUCCIÓN');

// Función para obtener URL con cache buster
export const getApiUrl = (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}?v=${CACHE_BUSTER}`;
  console.log('🔗 getApiUrl generada:', url);
  return url;
};

export default API_BASE_URL; 