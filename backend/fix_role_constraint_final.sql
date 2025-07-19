-- Script final para arreglar la restricción CHECK del rol
-- Este script elimina la restricción problemática y la recrea correctamente

-- 1. Eliminar la restricción CHECK existente
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Verificar que se eliminó
SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users' 
AND constraint_type = 'CHECK';

-- 3. Crear la nueva restricción CHECK con todos los roles válidos
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA'));

-- 4. Verificar que se creó correctamente
SELECT 
    constraint_name, 
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';

-- 5. Verificar que no hay usuarios con roles inválidos
SELECT 
    id, 
    username, 
    role 
FROM users 
WHERE role IS NULL OR role NOT IN ('ADMIN', 'SUPERVISOR', 'ESTABLECIMIENTO', 'JEFE_ZONA');

-- 6. Actualizar usuarios con roles NULL a ESTABLECIMIENTO
UPDATE users 
SET role = 'ESTABLECIMIENTO' 
WHERE role IS NULL;

-- 7. Verificar el resultado final
SELECT 
    role, 
    COUNT(*) as cantidad
FROM users 
GROUP BY role 
ORDER BY role; 