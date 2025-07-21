const { Pool } = require('pg');

const pool = new Pool({
  user: 'luxiot',
  host: 'tablero-control-1.onrender.com',
  database: 'sdo_tablero',
  password: 'Sistema2025',
  port: 5432,
});

module.exports = pool; 