const pool = require('./db');
const { hashPassword } = require('./auth');

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario administrador...');
    
    // Hash de la contraseña
    const hashedPassword = await hashPassword('admin123');
    
    // Crear usuario administrador
    const result = await pool.query(`
      INSERT INTO users (username, password_hash, email, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active
      RETURNING id, username, email, role
    `, [
      'admin',
      hashedPassword,
      'admin@sdo.gob.ar',
      'ADMIN',
      true
    ]);
    
    console.log('✅ Usuario administrador creado exitosamente:', result.rows[0]);
    
    // Crear establecimientos si no existen
    const establecimientos = [
      { nombre: '47 Materno Infantil', zona: 'ZONA CENTRO' },
      { nombre: '40 San Bernardo', zona: 'ZONA CENTRO' },
      { nombre: '55 Papa Francisco', zona: 'ZONA CENTRO' },
      { nombre: '25 San Carlos', zona: 'ZONA OESTE' },
      { nombre: '10 Nazareno', zona: 'ZONA OESTE' },
      { nombre: '12 Tartagal', zona: 'ZONA NORTE' }
    ];
    
    for (const est of establecimientos) {
      await pool.query(`
        INSERT INTO establecimientos (nombre, zona, activo)
        VALUES ($1, $2, $3)
        ON CONFLICT (nombre) DO UPDATE SET
          zona = EXCLUDED.zona,
          activo = EXCLUDED.activo
      `, [est.nombre, est.zona, true]);
    }
    
    console.log('✅ Establecimientos creados/actualizados');
    
    // Asignar todos los establecimientos al admin
    const adminId = result.rows[0].id;
    const establecimientosResult = await pool.query('SELECT id FROM establecimientos');
    
    for (const est of establecimientosResult.rows) {
      await pool.query(`
        INSERT INTO user_establecimientos (user_id, establecimiento_id, is_primary, assigned_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, establecimiento_id) DO NOTHING
      `, [adminId, est.id, true, adminId]);
    }
    
    console.log('✅ Establecimientos asignados al administrador');
    console.log('🎯 Usuario de prueba creado:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Email: admin@sdo.gob.ar');
    console.log('   Rol: ADMIN');
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser(); 