// Configuración global para el sistema de tableros
window.APP_CONFIG = {
  API_BASE_URL: 'https://tablero-control-1.onrender.com',
  VERSION: 'v2.0',
  TIMESTAMP: Date.now()
};

// Interceptar todas las llamadas fetch para asegurar URLs correctas
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Si la URL contiene localhost, reemplazarla automáticamente
  if (typeof url === 'string' && url.includes('localhost')) {
    const newUrl = url.replace(/http:\/\/localhost:\d+/, window.APP_CONFIG.API_BASE_URL);
    console.log('🔄 URL interceptada:', url, '→', newUrl);
    url = newUrl;
  }
  return originalFetch(url, options);
};

// Limpiar cache al cargar
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

console.log('🚀 Configuración global cargada:', window.APP_CONFIG); 