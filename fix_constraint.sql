-- Verificar la restricción actual
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_role_check';

-- Eliminar la restricción actual
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Crear la nueva restricción con todos los roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA'));

-- Verificar que se creó correctamente
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_role_check';
 