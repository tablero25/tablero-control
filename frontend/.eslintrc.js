module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'warn' : 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}; 