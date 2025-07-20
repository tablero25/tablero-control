// SCRIPT SIMPLE PARA CORREGIR URLs DE API
// Se ejecuta inmediatamente al cargar la página

console.log('🔧 Iniciando corrección de URLs de API...');

// Detectar si estamos en producción
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const productionUrl = 'https://tablero-control-1.onrender.com';

if (isProduction) {
    console.log('✅ Entorno de producción detectado');
    
    // Configurar URL base
    window.API_BASE_URL = productionUrl;
    
    // Función para obtener URLs de API
    window.getApiUrl = function(endpoint) {
        const timestamp = Date.now();
        return `${productionUrl}${endpoint}?v=${timestamp}`;
    };
    
    // Interceptar fetch para corregir URLs de localhost
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes('localhost:5001')) {
            const correctedUrl = url.replace('http://localhost:5001', productionUrl);
            console.log('🔄 Corrigiendo URL:', url, '→', correctedUrl);
            return originalFetch(correctedUrl, options);
        }
        return originalFetch(url, options);
    };
    
    // Limpiar cache
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Configuración aplicada correctamente');
    console.log('🌐 API_BASE_URL:', window.API_BASE_URL);
} else {
    console.log('🔧 Entorno de desarrollo detectado');
    window.API_BASE_URL = 'http://localhost:5001';
    window.getApiUrl = function(endpoint) {
        return `${window.API_BASE_URL}${endpoint}`;
    };
} 