const { Pool } = require('pg');

const pool = new Pool({
  user: 'luxiot',
  host: 'localhost',
  database: 'sdo_tablero',
  password: 'Sistema2025',
  port: 5432,
});

module.exports = pool; 