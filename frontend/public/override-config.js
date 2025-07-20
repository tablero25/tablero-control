// SCRIPT DE SOBRESCRITURA DE CONFIGURACIÓN
// Este script se ejecuta ANTES que React y sobrescribe cualquier configuración anterior

(function() {
    'use strict';
    
    console.log('🚀 SCRIPT DE SOBRESCRITURA EJECUTÁNDOSE...');
    
    // DETECTAR ENTORNO
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const productionUrl = 'https://tablero-control-1.onrender.com';
    const developmentUrl = 'http://localhost:5001';
    
    // SOBRESCRIBIR CONFIGURACIÓN GLOBAL
    window.API_BASE_URL = isProduction ? productionUrl : developmentUrl;
    
    // SOBRESCRIBIR FUNCIÓN getApiUrl
    window.getApiUrl = function(endpoint) {
        const timestamp = Date.now();
        const url = `${window.API_BASE_URL}${endpoint}?v=${timestamp}`;
        console.log('🔗 getApiUrl generada:', url);
        return url;
    };
    
    // SOBRESCRIBIR fetch para interceptar llamadas a localhost
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // Si la URL contiene localhost y estamos en producción, reemplazarla
        if (typeof url === 'string' && url.includes('localhost:5001') && isProduction) {
            const newUrl = url.replace('http://localhost:5001', productionUrl);
            console.log('🔄 Interceptando fetch de localhost:', url, '->', newUrl);
            return originalFetch(newUrl, options);
        }
        return originalFetch(url, options);
    };
    
    // LIMPIAR CACHE AGRESIVAMENTE
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) {
                caches.delete(name);
                console.log('🗑️ Cache eliminado:', name);
            });
        });
    }
    
    // LIMPIAR STORAGE
    localStorage.clear();
    sessionStorage.clear();
    console.log('🗑️ Storage limpiado');
    
    // LOGS DE CONFIRMACIÓN
    console.log('✅ CONFIGURACIÓN SOBRESCRITA:');
    console.log('📍 Hostname:', window.location.hostname);
    console.log('🌐 API_BASE_URL:', window.API_BASE_URL);
    console.log('🔧 Entorno:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');
    console.log('🕒 Timestamp:', new Date().toISOString());
    console.log('🔗 getApiUrl disponible:', typeof window.getApiUrl);
    console.log('🔄 fetch interceptado:', typeof window.fetch);
    
    // VERIFICAR QUE NO HAY REFERENCIAS A LOCALHOST
    setTimeout(() => {
        const scripts = document.querySelectorAll('script[src*="localhost"]');
        if (scripts.length > 0) {
            console.error('❌ ERROR: Scripts de localhost detectados:', scripts);
            console.log('🔄 Forzando recarga en 2 segundos...');
            setTimeout(() => {
                window.location.reload(true);
            }, 2000);
        } else {
            console.log('✅ No se detectaron scripts de localhost');
        }
    }, 1000);
    
})(); 