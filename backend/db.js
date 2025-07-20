const { Pool } = require('pg');

// Configuración de base de datos con variables de entorno para producción
const pool = new Pool({
  user: process.env.DB_USER || 'luxiot',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sdo_tablero',
  password: process.env.DB_PASSWORD || 'Sistema2025',
  port: process.env.DB_PORT || 5432,
  // Configuraciones adicionales para producción
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
});

// Manejo de errores de conexión
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
});

// Verificar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conexión a base de datos establecida correctamente');
  }
});

module.exports = pool; 