const crypto = require('crypto');

// Generar token de confirmación único
const generateConfirmationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generar fecha de expiración (24 horas desde ahora)
const generateExpirationDate = () => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  return expirationDate;
};

// Verificar si un token ha expirado
const isTokenExpired = (expirationDate) => {
  const now = new Date();
  const expiration = new Date(expirationDate);
  return now > expiration;
};

module.exports = {
  generateConfirmationToken,
  generateExpirationDate,
  isTokenExpired
}; 