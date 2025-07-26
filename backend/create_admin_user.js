const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'tablero_user',
  host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
  database: 'tablero_user',
  password: 'zdR9rbB8bhIke5DC7O6ANbxVnJ0PvJrM',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function createAdminUser() {
  try {
    console.log('🔧 Conectando a la base de datos de Render...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa');

    // Verificar si el admin ya existe
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      ['admin', 'admin@tablero.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('ℹ️ El usuario admin ya existe');
      return;
    }

    // Crear hash de contraseña
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario admin
    const result = await pool.query(
      `INSERT INTO users (
        username, email, dni, nombre, apellido, funcion, 
        password_hash, role, is_active, is_confirmed, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id, username, email, role`,
      [
        'admin',
        'admin@tablero.com',
        '12345678',
        'Administrador',
        'Sistema',
        'Administrador del Sistema',
        hashedPassword,
        'ADMIN',
        true,
        true
      ]
    );

    console.log('✅ Usuario admin creado exitosamente:');
    console.log('   ID:', result.rows[0].id);
    console.log('   Username:', result.rows[0].username);
    console.log('   Email:', result.rows[0].email);
    console.log('   Role:', result.rows[0].role);
    console.log('   Contraseña:', password);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

createAdminUser(); 