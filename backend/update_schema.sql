-- Actualizar tabla users con campos adicionales
ALTER TABLE users ADD COLUMN IF NOT EXISTS dni VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS apellido VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS funcion VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT TRUE;

-- Actualizar usuarios existentes con datos de prueba
UPDATE users SET 
  dni = '12345678',
  nombre = 'Administrador',
  apellido = 'Sistema',
  funcion = 'Administrador General',
  first_login = FALSE
WHERE username = 'admin';

UPDATE users SET 
  dni = '87654321',
  nombre = 'Supervisor',
  apellido = 'Uno',
  funcion = 'Supervisor de Zona',
  first_login = FALSE
WHERE username = 'supervisor1';

UPDATE users SET 
  dni = '11223344',
  nombre = 'Establecimiento',
  apellido = 'Uno',
  funcion = 'Jefe de Establecimiento',
  first_login = FALSE
WHERE username = 'establecimiento1'; 