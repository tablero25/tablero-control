const config = {
  development: {
    database: {
      user: 'postgres',
      host: 'localhost',
      database: 'tablero_db',
      password: '123456',
      port: 5432,
    },
    server: {
      port: 5001,
      cors: {
        origin: 'http://localhost:3000',
        credentials: true
      }
    },
    email: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu-password'
      }
    }
  },
  production: {
    database: {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'tablero_db',
      password: process.env.DB_PASSWORD || '123456',
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    server: {
      port: process.env.PORT || 5001,
      cors: {
        origin: process.env.FRONTEND_URL || 'https://tu-dominio.com',
        credentials: true
      }
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env]; 