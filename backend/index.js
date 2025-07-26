const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { Pool } = require('pg');

// Importar rutas de autenticación (comentado temporalmente para pruebas)
// const authRoutes = require('./authRoutes');
const { authenticateToken, getUserEstablecimientos } = require('./auth');
const { sendConfirmationEmail } = require('./emailConfig');
const validarAccesoEstablecimiento = async (req, res, next) => {
  try {
    const user = req.user;
    const establecimiento = decodeURIComponent(req.params.establecimiento);
    if (user.role === 'ADMIN' || user.role === 'DIRECTOR') return next();
    const asignados = await getUserEstablecimientos(user.id);
    const nombresAsignados = asignados.map(e => e.nombre);
    if (!nombresAsignados.includes(establecimiento)) {
      return res.status(403).json({ success: false, error: 'Acceso denegado a este establecimiento.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error validando acceso a establecimiento.' });
  }
};

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: 'tablero_user',
  host: 'dpg-d1tfjure5dus73dhglp0-a.oregon-postgres.render.com',
  database: 'tablero_user',
  password: 'zdR9rbB8bhIke5DC7O6ANbxVnJ0PvJrM',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// Probar conexión a la base de datos con reintentos
const MAX_DB_RETRIES = 10;
const DB_RETRY_DELAY_MS = 3000;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectWithRetry(attempt = 1) {
  try {
    await pool.query('SELECT NOW()');
    console.log(`✅ Conexión a la base de datos exitosa (intento ${attempt})`);
  } catch (err) {
    console.error(`❌ Error conectando a la base de datos (intento ${attempt}):`, err.message);
    if (attempt < MAX_DB_RETRIES) {
      console.log(`⏳ Reintentando conexión en ${DB_RETRY_DELAY_MS / 1000} segundos...`);
      await wait(DB_RETRY_DELAY_MS);
      return connectWithRetry(attempt + 1);
    } else {
      console.error('❌ No se pudo conectar a la base de datos después de varios intentos. Abortando.');
      process.exit(1);
    }
  }
}

// Iniciar conexión a la base de datos
connectWithRetry();

// Formatos de Excel soportados por la librería xlsx
const EXCEL_FORMATS = [
  '.xlsx',  // Excel Open XML Workbook
  '.xlsm',  // Excel Open XML Macro-Enabled Workbook
  '.xlsb',  // Excel Binary Workbook
  '.xls',   // Excel Workbook (legacy)
  '.xlt',   // Excel Template (legacy)
  '.xltx',  // Excel Open XML Template
  '.xltm',  // Excel Open XML Macro-Enabled Template
  '.ods',   // OpenDocument Spreadsheet
  '.fods',  // Flat OpenDocument Spreadsheet
  '.csv',   // Comma Separated Values
  '.txt',   // Text file
  '.rtf',   // Rich Text Format
  '.html',  // HTML file
  '.htm',   // HTML file
  '.xml',   // XML file
  '.sylk',  // Symbolic Link Format
  '.slk',   // Symbolic Link Format
  '.dif',   // Data Interchange Format
  '.prn',   // Lotus formatted text
  '.dbf',   // dBASE file
  '.wk1',   // Lotus 1-2-3 v1
  '.wk3',   // Lotus 1-2-3 v3
  '.wk4',   // Lotus 1-2-3 v4
  '.123',   // Lotus 1-2-3 v9
  '.wb1',   // Quattro Pro v1
  '.wb2',   // Quattro Pro v5
  '.wb3',   // Quattro Pro v6-8
  '.qpw',   // Quattro Pro v9+
  '.numbers' // Apple Numbers
];

// Función para verificar si un archivo tiene un formato Excel válido
function isValidExcelFormat(filename) {
  if (!filename || typeof filename !== 'string') return false;
  const ext = path.extname(filename).toLowerCase();
  return EXCEL_FORMATS.includes(ext);
}

// Función para obtener la lista de formatos para filtros
function getExcelFormatsForFilter() {
  return EXCEL_FORMATS.filter(f => f !== '.txt'); // Excluir .txt para evitar confusiones
}

// 🔍 FUNCIÓN PARA DETECTAR AÑO AUTOMÁTICAMENTE DESDE EL ARCHIVO EXCEL
function detectarAnioDeArchivo(rutaArchivo) {
  try {
    console.log(`🔍 [DETECTAR AÑO] Analizando archivo: ${rutaArchivo}`);
    
    if (!fs.existsSync(rutaArchivo)) {
      console.log(`❌ [DETECTAR AÑO] Archivo no existe: ${rutaArchivo}`);
      return null;
    }
    
    // Leer archivo Excel
    const workbook = XLSX.readFile(rutaArchivo);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length < 2) {
      console.log(`❌ [DETECTAR AÑO] Archivo sin datos suficientes`);
      return null;
    }
    
    // Buscar la columna PERIANO en los headers
    const headers = data[0] ? data[0].map(h => String(h).replace(/[^A-Z0-9_]/gi, '').toUpperCase()) : [];
    const anioIdx = headers.indexOf('PERIANO');
    
    if (anioIdx === -1) {
      console.log(`❌ [DETECTAR AÑO] No se encontró columna PERIANO en headers:`, headers);
      return null;
    }
    
    console.log(`✅ [DETECTAR AÑO] Columna PERIANO encontrada en índice: ${anioIdx}`);
    
    // Extraer todos los años válidos de la columna PERIANO
    const aniosEncontrados = [];
    for (let i = 1; i < data.length; i++) { // Saltar header
      const row = data[i];
      if (row && row[anioIdx]) {
        const anioVal = String(row[anioIdx]).trim();
        if (!isNaN(Number(anioVal)) && anioVal.length === 4) {
          const anio = Number(anioVal);
          if (anio >= 2000 && anio <= 2100) { // Validar rango razonable
            aniosEncontrados.push(anio);
          }
        }
      }
    }
    
    if (aniosEncontrados.length === 0) {
      console.log(`❌ [DETECTAR AÑO] No se encontraron años válidos en PERIANO`);
      return null;
    }
    
    // Encontrar el año más común
    const conteoPorAnio = {};
    aniosEncontrados.forEach(anio => {
      conteoPorAnio[anio] = (conteoPorAnio[anio] || 0) + 1;
    });
    
    const anioMasComun = Object.keys(conteoPorAnio).reduce((a, b) => 
      conteoPorAnio[a] > conteoPorAnio[b] ? a : b
    );
    
    console.log(`✅ [DETECTAR AÑO] Años encontrados:`, conteoPorAnio);
    console.log(`✅ [DETECTAR AÑO] Año más común detectado: ${anioMasComun}`);
    
    return Number(anioMasComun);
    
  } catch (error) {
    console.log(`❌ [DETECTAR AÑO] Error al leer Excel:`, error.message);
    return null;
  }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos del build de React (desde frontend/build)
app.use('/static', express.static(path.join(__dirname, '../frontend/build/static')));
app.use('/logo192.png', express.static(path.join(__dirname, '../frontend/build/logo192.png')));
app.use('/favicon.ico', express.static(path.join(__dirname, '../frontend/build/favicon.ico')));
app.use('/manifest.json', express.static(path.join(__dirname, '../frontend/build/manifest.json')));

// Rutas de autenticación (definidas directamente para pruebas)
// app.use('/api/auth', authRoutes);

// Definir rutas de autenticación directamente
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth routes funcionando directamente en index.js' });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    res.json({
      success: true,
      message: 'Login funcionando directamente en index.js',
      user: { username, role: 'admin' }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, dni, nombre, apellido, funcion } = req.body;
    
    if (!username || !email || !dni || !nombre || !apellido || !funcion) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El usuario o email ya existe en el sistema' 
      });
    }

    // Generar token de confirmación
    const confirmationToken = require('crypto').randomBytes(32).toString('hex');
    
    // Crear usuario en la base de datos
    const newUser = await pool.query(
      `INSERT INTO users (username, email, dni, nombre, apellido, funcion, confirmation_token, is_confirmed, password_hash, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING id, username, email, nombre, apellido`,
      [username, email, dni, nombre, apellido, funcion, confirmationToken, false, 'temp_password_hash']
    );

    // Enviar email de confirmación
    try {
      await sendConfirmationEmail(email, username, confirmationToken);
      console.log('✅ Email de confirmación enviado a:', email);
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      // No fallar el registro si el email falla
    }

    res.json({
      success: true,
      message: 'Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta.',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Verificación funcionando directamente en index.js',
    user: { id: 1, username: 'test', role: 'admin' }
  });
});

// Ruta para confirmar usuario con token
app.get('/api/auth/confirmar-usuario', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token de confirmación requerido' 
      });
    }

    console.log('🔍 [CONFIRMAR] Verificando token:', token);
    
    // Buscar usuario con el token
    const userResult = await pool.query(
      'SELECT id, username, email, nombre, apellido, is_confirmed, confirmation_token FROM users WHERE confirmation_token = $1',
      [token]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ [CONFIRMAR] Token no encontrado');
      return res.status(404).json({ 
        success: false, 
        error: 'Token de confirmación inválido' 
      });
    }

    const user = userResult.rows[0];
    console.log('✅ [CONFIRMAR] Usuario encontrado:', user.email);

    // Verificar si el usuario ya está confirmado
    if (user.is_confirmed) {
      console.log('ℹ️ [CONFIRMAR] Usuario ya confirmado');
      return res.status(400).json({ 
        success: false, 
        error: 'La cuenta ya está confirmada' 
      });
    }

    // Confirmar usuario y limpiar token
    await pool.query(
      'UPDATE users SET is_confirmed = true, confirmation_token = NULL WHERE id = $1',
      [user.id]
    );

    console.log('✅ [CONFIRMAR] Usuario confirmado exitosamente:', user.email);

    res.json({
      success: true,
      message: 'Cuenta confirmada exitosamente. Ya puedes iniciar sesión.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido
      }
    });

  } catch (error) {
    console.error('❌ [CONFIRMAR] Error confirmando cuenta:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Configuración temporal de multer - guardaremos en carpeta temporal primero
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { establecimiento } = req.params;
    if (!establecimiento) {
      return cb(new Error('Falta datos de establecimiento'), null);
    }
    // Crear carpeta temporal para el establecimiento
    const tempDir = path.join(__dirname, 'temp', establecimiento);
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Agregar timestamp para evitar conflictos
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}_${timestamp}${ext}`);
  }
});
const upload = multer({ storage });

// Guardar archivo Excel con detección automática de año
app.post('/guardar/:establecimiento/:anio', upload.single('file'), async (req, res) => {
  try {
    const { establecimiento, anio: anioParametro } = req.params;
    console.log('🔄 Iniciando guardado con detección automática de año');
    console.log('📁 Establecimiento:', establecimiento);
    console.log('📅 Año del parámetro:', anioParametro);
    console.log('📄 Archivo recibido:', req.file?.originalname);
    
    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).json({ success: false, error: 'No se recibió archivo.' });
    }
    
    const archivoTemporal = req.file.path;
    console.log('📂 Archivo temporal en:', archivoTemporal);
    
    // 🔍 DETECTAR AÑO AUTOMÁTICAMENTE DEL ARCHIVO
    const anioDetectado = detectarAnioDeArchivo(archivoTemporal);
    console.log('🎯 Año detectado del archivo:', anioDetectado);
    
    // Determinar qué año usar (detectado vs parámetro)
    const anioFinal = anioDetectado || anioParametro;
    const cambioAutomatico = anioDetectado && anioDetectado.toString() !== anioParametro;
    
    console.log('✅ Año final a usar:', anioFinal);
    if (cambioAutomatico) {
      console.log('🔄 CAMBIO AUTOMÁTICO: de', anioParametro, 'a', anioFinal);
    }
    
    // Crear directorio final
    const dirFinal = path.join(__dirname, 'data', establecimiento, anioFinal.toString());
    fs.mkdirSync(dirFinal, { recursive: true });
    console.log('📁 Directorio final:', dirFinal);
    
    // Eliminar archivos Excel existentes en la carpeta final
    if (fs.existsSync(dirFinal)) {
      const archivosExistentes = fs.readdirSync(dirFinal).filter(f => 
        isValidExcelFormat(f)
      );
      console.log('🗑️ Archivos existentes a eliminar:', archivosExistentes);
      archivosExistentes.forEach(f => {
        const filePath = path.join(dirFinal, f);
        console.log('🗑️ Eliminando:', filePath);
        fs.unlinkSync(filePath);
      });
    }
    
    // Mover archivo de carpeta temporal a carpeta final
    const nombreOriginal = req.file.originalname;
    const archivoFinal = path.join(dirFinal, nombreOriginal);
    
    console.log('📦 Moviendo archivo:');
    console.log('  Desde:', archivoTemporal);
    console.log('  Hacia:', archivoFinal);
    
    fs.renameSync(archivoTemporal, archivoFinal);
    
    // Limpiar carpeta temporal si está vacía
    const tempDir = path.dirname(archivoTemporal);
    try {
      const archivosTemp = fs.readdirSync(tempDir);
      if (archivosTemp.length === 0) {
        fs.rmdirSync(tempDir);
        console.log('🧹 Carpeta temporal limpiada');
      }
    } catch (e) {
      // Ignorar errores de limpieza
    }
    
    // Verificar que se guardó correctamente
    const archivoExiste = fs.existsSync(archivoFinal);
    console.log('✅ ¿Archivo guardado correctamente?', archivoExiste);
    
    // Preparar respuesta
    const respuesta = {
      success: true,
      message: cambioAutomatico 
        ? `Archivo guardado correctamente. Año detectado automáticamente: ${anioFinal}` 
        : 'Archivo guardado correctamente.',
      anioOriginal: anioParametro,
      anioUsado: anioFinal.toString(),
      cambioAutomatico,
      anioDetectado: anioDetectado || null,
      nombreArchivo: nombreOriginal
    };
    
    if (cambioAutomatico) {
      console.log('🎉 ÉXITO CON CAMBIO AUTOMÁTICO:', respuesta);
    } else {
      console.log('✅ ÉXITO:', respuesta);
    }
    
    res.json(respuesta);
  } catch (err) {
    console.error('❌ Error al guardar:', err);
    
    // Limpiar archivo temporal en caso de error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🧹 Archivo temporal limpiado después del error');
      } catch (e) {
        console.log('⚠️ No se pudo limpiar archivo temporal:', e.message);
      }
    }
    
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar años/archivos por establecimiento
app.get('/archivos/:establecimiento', authenticateToken, validarAccesoEstablecimiento, (req, res) => {
  try {
    const establecimiento = req.params.establecimiento;
    const dir = path.join(__dirname, 'data', establecimiento);
    if (!fs.existsSync(dir)) return res.json({ archivos: [] });
    const anios = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());
    const archivos = anios.flatMap(anio => {
      const files = fs.readdirSync(path.join(dir, anio)).filter(f => isValidExcelFormat(f));
      return files.map(f => ({ anio, archivo: f }));
    });
    res.json({ archivos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar archivos por establecimiento y año (case-insensitive)
app.get('/archivos/:establecimiento/:anio', authenticateToken, validarAccesoEstablecimiento, (req, res) => {
  try {
    const { establecimiento, anio } = req.params;
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) return res.json({ archivos: [] });
    // Buscar carpeta de establecimiento ignorando mayúsculas/minúsculas
    const estDirs = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)).isDirectory());
    const estDir = estDirs.find(f => f.toLowerCase() === decodeURIComponent(establecimiento).toLowerCase());
    if (!estDir) return res.json({ archivos: [] });
    const yearDir = path.join(dataDir, estDir, anio);
    if (!fs.existsSync(yearDir)) return res.json({ archivos: [] });
    const archivos = fs.readdirSync(yearDir)
      .filter(f => isValidExcelFormat(f))
      .map(f => ({ archivo: f }));
    res.json({ archivos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Leer archivo Excel guardado
app.get('/leer/:establecimiento/:anio/:archivo', authenticateToken, validarAccesoEstablecimiento, async (req, res) => {
  try {
    const { establecimiento, anio, archivo } = req.params;
    console.log('Parámetros recibidos:', { establecimiento, anio, archivo });
    
    const filePath = path.join(__dirname, 'data', establecimiento, anio, archivo);
    let fileToRead = filePath;
    
    console.log('Ruta inicial del archivo:', filePath);
    console.log('¿Existe el archivo inicial?', fs.existsSync(fileToRead));
    
    if (!fs.existsSync(fileToRead)) {
      // Buscar ignorando mayúsculas/minúsculas y espacios
      const dir = path.join(__dirname, 'data', establecimiento, anio);
      console.log('Buscando en directorio:', dir);
      console.log('¿Existe el directorio?', fs.existsSync(dir));
      
      if (fs.existsSync(dir)) {
        const archivos = fs.readdirSync(dir);
        console.log('Archivos encontrados en el directorio:', archivos);
        
        const archivoBuscado = archivos.find(f => f.replace(/\s+/g, '').toLowerCase() === archivo.replace(/\s+/g, '').toLowerCase());
        console.log('Archivo buscado:', archivoBuscado);
        
        if (archivoBuscado) {
          fileToRead = path.join(dir, archivoBuscado);
          console.log('Archivo encontrado en:', fileToRead);
        }
      }
    }
    console.log('Archivo final a leer:', fileToRead);
    if (!fs.existsSync(fileToRead)) return res.status(404).json({ success: false, error: 'Archivo no encontrado.' });
    
    if (isValidExcelFormat(archivo)) {
      try {
        // Leer archivo Excel
        const workbook = XLSX.readFile(fileToRead);
        const sheetName = workbook.SheetNames[0]; // Primera hoja
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('Datos Excel leídos:', data.length, 'filas');
        console.log('Primeras 3 filas:', data.slice(0, 3));
        
        if (data.length < 2) return res.json({ success: false, error: 'El archivo Excel no tiene datos.' });
        
        // Procesar headers (primera fila)
        const headers = data[0].map(h => String(h).replace(/[^A-Z0-9_]/gi, '').toUpperCase());
        console.log('Headers procesados:', headers);
        
        // Procesar datos (filas siguientes)
        const processedData = data.slice(1).map((row, idx) => {
          console.log(`Fila ${idx + 1}:`, row);
          
          // Solo procesar si la cantidad de columnas es igual a headers
          if (row.length !== headers.length) {
            console.log(`Fila ignorada (cantidad columnas): ${row.length} vs ${headers.length}`, row);
            return null;
          }
          
          // Solo procesar si PERIANO y PERIMES son numéricos
          const anioIdx = headers.indexOf('PERIANO');
          const mesIdx = headers.indexOf('PERIMES');
          
          if (anioIdx === -1 || mesIdx === -1) {
            console.log(`Fila ignorada (no encuentra PERIANO o PERIMES):`, row);
            return null;
          }
          
          const anioVal = row[anioIdx] ? String(row[anioIdx]).trim() : '';
          const mesVal = row[mesIdx] ? String(row[mesIdx]).trim() : '';
          
          if (isNaN(Number(anioVal)) || isNaN(Number(mesVal))) {
            console.log(`Fila ignorada (PERIANO/PERIMES no numérico): PERIANO=${anioVal}, PERIMES=${mesVal}`, row);
            return null;
          }
          
          const obj = {};
          headers.forEach((h, i) => { obj[h] = row[i] ? String(row[i]).trim() : ''; });
          return obj;
        }).filter(x => x !== null);
        
        console.log('Headers:', headers);
        console.log('Primeras filas procesadas:', processedData.slice(0, 3));
        console.log('Cantidad de filas procesadas:', processedData.length);
        
        return res.json({ success: true, data: processedData });
      } catch (excelErr) {
        return res.json({ success: false, error: 'Error al leer o parsear el archivo Excel: ' + excelErr.message });
      }
    } else {
      return res.json({ success: false, error: `Solo se permiten archivos de Excel. Formatos soportados: ${EXCEL_FORMATS.join(', ')}.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== RUTAS PARA RANKING DE DIAGNÓSTICO =====

// Configuración de almacenamiento para ranking
const rankingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { establecimiento, categoria, anio } = req.params;
    if (!establecimiento || !categoria || !anio) {
      return cb(new Error('Faltan datos de establecimiento, categoría o año'), null);
    }
    const dir = path.join(__dirname, 'data', establecimiento, categoria, anio);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const rankingUpload = multer({ storage: rankingStorage });

// 🗂️ CONSTANTES Y FUNCIONES GLOBALES PARA DETECCIÓN DE MESES
const MESES_NOMBRES = {
  'ENERO': ['enero', 'january', '01', 'ene', 'jan'],
  'FEBRERO': ['febrero', 'february', '02', 'feb'],
  'MARZO': ['marzo', 'march', '03', 'mar'],
  'ABRIL': ['abril', 'april', '04', 'abr', 'apr'],
  'MAYO': ['mayo', 'may', '05'],
  'JUNIO': ['junio', 'june', '06', 'jun'],
  'JULIO': ['julio', 'july', '07', 'jul'],
  'AGOSTO': ['agosto', 'august', '08', 'ago', 'aug'],
  'SEPTIEMBRE': ['septiembre', 'september', '09', 'sep'],
  'OCTUBRE': ['octubre', 'october', '10', 'oct'],
  'NOVIEMBRE': ['noviembre', 'november', '11', 'nov'],
  'DICIEMBRE': ['diciembre', 'december', '12', 'dic', 'dec']
};

// 🔍 FUNCIÓN GLOBAL PARA DETECTAR MES DE ARCHIVO (PRIORIDAD AL CONTENIDO EXCEL)
function detectarMesDeArchivo(nombreArchivo, rutaCompleta) {
  console.log(`🔍 [DETECTAR MES] Analizando archivo: ${nombreArchivo}`);
  
  // 🎯 PRIORIDAD 1: LEER CONTENIDO DEL EXCEL (FUENTE DE VERDAD)
  try {
    if (!fs.existsSync(rutaCompleta)) {
      console.log(`❌ [DETECTAR MES] Archivo no existe: ${rutaCompleta}`);
      return null;
    }
    
    console.log(`📖 [DETECTAR MES] Leyendo contenido del Excel...`);
    const workbook = XLSX.readFile(rutaCompleta);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Buscar fechas en las primeras filas (AMPLIADO)
    let fechaDesde = null;
    let fechaHasta = null;
    
    for (let i = 0; i < Math.min(data.length, 15); i++) {
      const row = data[i];
      if (row && row.length >= 2) {
        for (let j = 0; j < Math.min(row.length, 5); j++) {
          const cellValue = String(row[j]).toLowerCase();
          
          if (cellValue.includes('desde') && j + 1 < row.length) {
            fechaDesde = String(row[j + 1]);
            console.log(`📅 [DETECTAR MES] Encontrado "Desde": ${fechaDesde}`);
          }
          if (cellValue.includes('hasta') && j + 1 < row.length) {
            fechaHasta = String(row[j + 1]);
            console.log(`📅 [DETECTAR MES] Encontrado "Hasta": ${fechaHasta}`);
          }
        }
      }
    }
    
    if (fechaDesde && fechaHasta) {
      // Verificar si es todo el año
      const esDesdeEnero = fechaDesde.includes('01/01/') || fechaDesde.includes('1/1/');
      const esHastaDiciembre = fechaHasta.includes('31/12/') || fechaHasta.includes('30/12/');
      
      if (esDesdeEnero && esHastaDiciembre) {
        console.log(`✅ [DETECTAR MES] Archivo ${nombreArchivo} detectado como TODO EL AÑO (${fechaDesde} - ${fechaHasta})`);
        return 'TODOS'; // Es archivo de todo el año
      }
      
      // Si no es todo el año, extraer mes específico de la fecha "Desde"
      if (fechaDesde.includes('/')) {
        const partes = fechaDesde.split('/');
        if (partes.length >= 2) {
          // Soportar formatos DD/MM/YYYY, DD/MM/YY y MM/DD variants
          let mesNumero = null;
          
          // Intentar DD/MM primero (formato más común)
          const dia = parseInt(partes[0]);
          const mes = parseInt(partes[1]);
          
          if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12) {
            mesNumero = mes; // Formato DD/MM
          } else if (mes >= 1 && mes <= 31 && dia >= 1 && dia <= 12) {
            mesNumero = dia; // Formato MM/DD
          }
          
          if (mesNumero && mesNumero >= 1 && mesNumero <= 12) {
            const mesesArray = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                              'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            const mesDetectado = mesesArray[mesNumero - 1];
            console.log(`✅ [DETECTAR MES] MES DETECTADO desde Excel: ${nombreArchivo} → ${mesDetectado} (${fechaDesde} - ${fechaHasta})`);
            console.log(`🎯 [DETECTAR MES] ¡CONTENIDO EXCEL tiene PRIORIDAD sobre nombre de archivo!`);
            return mesDetectado;
          }
        }
      }
    } else {
      console.log(`⚠️  [DETECTAR MES] No se encontraron fechas "Desde/Hasta" en Excel de ${nombreArchivo}`);
    }
  } catch (e) {
    console.log(`❌ [DETECTAR MES] Error al leer Excel ${nombreArchivo}:`, e.message);
  }
  
  // 🎯 PRIORIDAD 2: SOLO SI NO SE DETECTÓ DEL EXCEL, BUSCAR EN NOMBRE DEL ARCHIVO
  console.log(`⚠️  [DETECTAR MES] No se detectó mes desde contenido Excel, intentando desde nombre de archivo...`);
  const nombreLower = nombreArchivo.toLowerCase();
  
  for (const [mes, variantes] of Object.entries(MESES_NOMBRES)) {
    for (const variante of variantes) {
      if (nombreLower.includes(variante.toLowerCase())) {
        console.log(`⚠️  [DETECTAR MES] MES DETECTADO desde nombre (fallback): ${nombreArchivo} → ${mes} (patrón: ${variante})`);
        console.log(`🚨 [DETECTAR MES] ADVERTENCIA: Usando nombre de archivo como fallback - verificar contenido Excel`);
        return mes;
      }
    }
  }
  
  console.log(`❌ [DETECTAR MES] No se pudo detectar mes para archivo: ${nombreArchivo}`);
  return null;
}

// Agregar middleware de logging para debug
app.use('/ranking', (req, res, next) => {
  console.log(`[RANKING] ${req.method} ${req.originalUrl}`);
  console.log('[RANKING] Params:', req.params);
  console.log('[RANKING] Query:', req.query);
  next();
});

// 🔒 MAP PARA PREVENIR UPLOADS SIMULTÁNEOS DEL MISMO ARCHIVO
const uploadsEnProceso = new Map();

// 🧹 LIMPIAR UPLOADS ANTIGUOS CADA 5 MINUTOS
setInterval(() => {
  const ahora = Date.now();
  const tiempoLimite = 5 * 60 * 1000; // 5 minutos
  
  for (const [key, timestamp] of uploadsEnProceso.entries()) {
    if (ahora - timestamp > tiempoLimite) {
      uploadsEnProceso.delete(key);
      console.log('🧹 Limpieza automática de upload:', key);
    }
  }
}, 5 * 60 * 1000);

// Guardar archivo Excel para ranking por establecimiento, categoría y año
app.post('/ranking/guardar/:establecimiento/:categoria/:anio', rankingUpload.single('file'), async (req, res) => {
  try {
    const { establecimiento, categoria, anio } = req.params;
    console.log('[RANKING] POST /ranking/guardar/' + encodeURIComponent(establecimiento) + '/' + encodeURIComponent(categoria) + '/' + anio);
    console.log('[RANKING] Params:', req.params);
    console.log('[RANKING] Query:', req.query);
    console.log('Guardando archivo de ranking para:', { establecimiento, categoria, anio });
    
    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).json({ success: false, error: 'No se recibió archivo.' });
    }
    
    // 🔒 PREVENIR UPLOADS SIMULTÁNEOS DEL MISMO ARCHIVO
    const uploadKey = `${establecimiento}_${categoria}_${anio}_${req.file.originalname}`;
    if (uploadsEnProceso.has(uploadKey)) {
      console.log('⚠️  Upload duplicado detectado, rechazando:', uploadKey);
      return res.status(409).json({ 
        success: false, 
        error: 'Ya hay una subida en proceso para este archivo. Espera a que termine.' 
      });
    }
    
    uploadsEnProceso.set(uploadKey, Date.now());
    console.log('🔒 Bloqueando upload:', uploadKey);
    
         console.log('Archivo recibido:', {
       originalname: req.file.originalname,
       mimetype: req.file.mimetype,
       size: req.file.size,
       path: req.file.path
     });
    
    // 🔍 DETECCIÓN MEJORADA DE FECHAS Y AÑOS EN ARCHIVOS EXCEL
    let fechaInfo = null;
    
    try {
      // ⏳ VERIFICAR QUE EL ARCHIVO NO ESTÉ BLOQUEADO ANTES DE LEERLO
      if (!fs.existsSync(req.file.path)) {
        throw new Error('Archivo no encontrado después de la subida');
      }
      
      // 🔄 REINTENTAR LECTURA SI EL ARCHIVO ESTÁ BLOQUEADO
      let workbook;
      let reintentos = 0;
      const maxReintentos = 3;
      
      while (reintentos < maxReintentos) {
        try {
          workbook = XLSX.readFile(req.file.path);
          break; // Éxito, salir del bucle
        } catch (readError) {
          if (readError.code === 'EBUSY' || readError.code === 'EMFILE') {
            reintentos++;
            console.log(`⏳ Archivo bloqueado, reintento ${reintentos}/${maxReintentos} en 500ms...`);
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            throw readError; // Error diferente, lanzar inmediatamente
          }
        }
      }
      
      if (!workbook) {
        throw new Error('No se pudo leer el archivo después de varios intentos');
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // 🔍 VALIDACIÓN DE CONTENIDO VS CATEGORÍA
      const categoriasValidas = {
        'Ranking de diagnóstico de emergencia': ['EMERGENCIA', 'URGENCIA'],
        'Ranking de diagnósticos de atención': ['ATENCIÓN', 'ATENCION'],
        'Ranking de mortalidad': ['MORTALIDAD', 'MUERTE', 'FALLECIDO'],
        'Ranking de motivos de egresos': ['EGRESO', 'EGRESOS', 'ALTA', 'MOTIVO']
      };
      
      let tituloEncontrado = false;
      let tituloArchivo = '';
      
      // Buscar título en las primeras 10 filas
      for (let i = 0; i < Math.min(data.length, 10) && !tituloEncontrado; i++) {
        const row = data[i];
        if (row && row.length >= 1) {
          for (let j = 0; j < row.length; j++) {
            const cellValue = String(row[j]).toUpperCase();
            
            // Buscar si contiene "RANKING" y alguna palabra clave
            if (cellValue.includes('RANKING') && cellValue.length > 10) {
              tituloArchivo = cellValue;
              
              // Verificar si el título coincide con la categoría seleccionada
              const palabrasClave = categoriasValidas[categoria];
              if (palabrasClave) {
                tituloEncontrado = palabrasClave.some(palabra => 
                  cellValue.includes(palabra)
                );
                
                if (tituloEncontrado) {
                  console.log(`✅ TÍTULO VÁLIDO encontrado: "${tituloArchivo}"`);
                  console.log(`✅ Coincide con categoría: "${categoria}"`);
                  break;
                }
              }
            }
          }
        }
      }
      
      // Si no se encontró título válido, rechazar archivo
      if (!tituloEncontrado) {
        console.log(`❌ TÍTULO NO VÁLIDO para categoría "${categoria}"`);
        console.log(`📋 Título encontrado: "${tituloArchivo}"`);
        console.log(`🔍 Palabras clave esperadas: ${categoriasValidas[categoria]?.join(', ')}`);
        
        // Limpiar archivo subido
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        uploadsEnProceso.delete(uploadKey);
        
        return res.status(400).json({ 
          success: false, 
          error: `El archivo no corresponde a la categoría "${categoria}". Título encontrado: "${tituloArchivo}". Verifique que el archivo sea del tipo correcto.`,
          categoriaEsperada: categoria,
          tituloEncontrado: tituloArchivo
        });
      }
      
      // 📅 BÚSQUEDA MÚLTIPLE DE FECHAS Y AÑOS
      let fechaDesde = null;
      let fechaHasta = null;
      let añoDetectado = null;
      
      // 🔍 Estrategia 1: Buscar en filas "Desde" y "Hasta" (AMPLIADO)
      for (let i = 0; i < Math.min(data.length, 20); i++) {
        const row = data[i];
        if (row && row.length >= 1) {
          for (let j = 0; j < Math.min(row.length, 10); j++) {
            const cellValue = String(row[j]).toLowerCase();
            
            // Buscar "desde" en cualquier columna
            if (cellValue.includes('desde') && j + 1 < row.length) {
              fechaDesde = String(row[j + 1]);
              console.log(`📅 Encontrado "Desde" en fila ${i+1}, columna ${j+2}: ${fechaDesde}`);
            }
            
            // Buscar "hasta" en cualquier columna
            if (cellValue.includes('hasta') && j + 1 < row.length) {
              fechaHasta = String(row[j + 1]);
              console.log(`📅 Encontrado "Hasta" en fila ${i+1}, columna ${j+2}: ${fechaHasta}`);
            }
          }
        }
      }
      
      // 🔍 Estrategia 2: Buscar años directamente en el contenido (NUEVO)
      if (!añoDetectado) {
        for (let i = 0; i < Math.min(data.length, 30); i++) {
          const row = data[i];
          if (row) {
            for (let j = 0; j < row.length; j++) {
              const cellValue = String(row[j]);
              
              // Buscar años 2024, 2025, etc.
              const añoMatch = cellValue.match(/\b(202[0-9])\b/);
              if (añoMatch) {
                añoDetectado = parseInt(añoMatch[1]);
                console.log(`🎯 AÑO DETECTADO en contenido: ${añoDetectado} (fila ${i+1}, columna ${j+1})`);
                break;
              }
              
              // Buscar fechas completas como "12/25", "25/12", etc.
              const fechaMatch = cellValue.match(/(\d{1,2})\/(\d{1,2})\/?(2[0-9])?/);
              if (fechaMatch && fechaMatch[3]) {
                añoDetectado = parseInt(`20${fechaMatch[3]}`);
                console.log(`🎯 AÑO DETECTADO en fecha: ${añoDetectado} (${cellValue})`);
                break;
              }
            }
            if (añoDetectado) break;
          }
        }
      }
      
      // 🔍 Estrategia 3: Analizar nombre del archivo (NUEVO)
      if (!añoDetectado) {
        const nombreArchivo = req.file.originalname.toLowerCase();
        const añoEnNombre = nombreArchivo.match(/\b(202[0-9])\b/);
        if (añoEnNombre) {
          añoDetectado = parseInt(añoEnNombre[1]);
          console.log(`🎯 AÑO DETECTADO en nombre de archivo: ${añoDetectado} (${nombreArchivo})`);
        }
      }
      
      console.log('🔍 RESULTADO BÚSQUEDA:', { 
        fechaDesde, 
        fechaHasta, 
        añoDetectado,
        archivoAnalizado: req.file.originalname 
      });
      
      if (fechaDesde && fechaHasta) {
        // Extraer fechas desde y hasta con patrones más flexibles
        const fechaDesdeMatch = fechaDesde.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        const fechaHastaMatch = fechaHasta.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        
        if (fechaDesdeMatch && fechaHastaMatch) {
          const diaDesde = parseInt(fechaDesdeMatch[1]);
          const mesDesde = parseInt(fechaDesdeMatch[2]);
          let yearDesde = parseInt(fechaDesdeMatch[3]);
          
          const diaHasta = parseInt(fechaHastaMatch[1]);
          const mesHasta = parseInt(fechaHastaMatch[2]);
          let yearHasta = parseInt(fechaHastaMatch[3]);
          
          // ✅ MEJORADA: Lógica de conversión de años de 2 dígitos a 4 dígitos
          if (yearDesde < 100) {
            // Para años 00-49 → 2000-2049, para años 50-99 → 1950-1999
            yearDesde = yearDesde <= 49 ? 2000 + yearDesde : 1900 + yearDesde;
          }
          if (yearHasta < 100) {
            yearHasta = yearHasta <= 49 ? 2000 + yearHasta : 1900 + yearHasta;
          }
          
          console.log(`✅ DETECCIÓN DE AÑO: Excel: ${yearDesde}, Parámetro: ${anio}`);
          
          const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
          
          // Verificar si es todo el año (01/01 a 31/12 del mismo año)
          const esTodosLosMeses = (
            diaDesde === 1 && mesDesde === 1 &&  // Empieza el 1 de enero
            ((diaHasta === 31 && mesHasta === 12) || // Termina el 31 de diciembre
             (diaHasta === 30 && mesHasta === 12)) && // O el 30 de diciembre (algunos archivos)
            yearDesde === yearHasta  // Mismo año
          );
          
          if (esTodosLosMeses) {
            fechaInfo = {
              mes: 'TODOS',
              mesNumero: 0, // 0 indica todos los meses
              año: yearDesde, // USAR EL AÑO DETECTADO DEL ARCHIVO
              fechaCompleta: `${fechaDesde} - ${fechaHasta}`,
              archivo: req.file.originalname,
              esTodoElAño: true
            };
          } else {
            // Es un mes específico, usar la fecha "desde"
            fechaInfo = {
              mes: meses[mesDesde - 1],
              mesNumero: mesDesde,
              año: yearDesde, // USAR EL AÑO DETECTADO DEL ARCHIVO
              fechaCompleta: `${fechaDesde} - ${fechaHasta}`,
              archivo: req.file.originalname,
              esTodoElAño: false
            };
          }
          
          console.log('✅ FECHA EXTRAÍDA de "Desde/Hasta":', fechaInfo);
        }
      } else {
        // 🎯 USAR AÑO DETECTADO POR OTRAS ESTRATEGIAS O FALLBACK AL PARÁMETRO
        const añoFinal = añoDetectado || parseInt(anio);
        const esMismoAño = añoFinal.toString() === anio;
        
        if (añoDetectado && !esMismoAño) {
          console.log(`🎯 USANDO AÑO DETECTADO: ${añoDetectado} (diferente al parámetro: ${anio})`);
        } else if (añoDetectado && esMismoAño) {
          console.log(`✅ AÑO DETECTADO COINCIDE con parámetro: ${añoDetectado}`);
        } else {
          console.log(`⚠️  NO SE DETECTÓ AÑO, usando parámetro: ${anio}`);
        }
        
        fechaInfo = {
          mes: 'DESCONOCIDO',
          mesNumero: 0,
          año: añoFinal, // USAR AÑO DETECTADO O PARÁMETRO COMO FALLBACK
          fechaCompleta: añoDetectado 
            ? `Año detectado automáticamente: ${añoDetectado}` 
            : 'Fecha no detectada - usando año del parámetro',
          archivo: req.file.originalname,
          esTodoElAño: false,
          sinFecha: !añoDetectado,
          añoDetectadoAutomaticamente: !!añoDetectado
        };
      }
    } catch (excelErr) {
      console.log('❌ Error al leer Excel:', excelErr.message);
      
      // 🔍 ÚLTIMO INTENTO: Detectar año del nombre del archivo
      let añoDelNombre = null;
      const nombreArchivo = req.file.originalname.toLowerCase();
      const añoEnNombre = nombreArchivo.match(/\b(202[0-9])\b/);
      if (añoEnNombre) {
        añoDelNombre = parseInt(añoEnNombre[1]);
        console.log(`🎯 AÑO DETECTADO en nombre (como último recurso): ${añoDelNombre}`);
      }
      
      const añoFinal = añoDelNombre || parseInt(anio);
      
      fechaInfo = {
        mes: 'ERROR',
        mesNumero: 0,
        año: añoFinal, // USAR AÑO DETECTADO DEL NOMBRE O PARÁMETRO
        fechaCompleta: añoDelNombre 
          ? `Año detectado del nombre del archivo: ${añoDelNombre}` 
          : 'Error al leer fechas - usando año del parámetro',
        archivo: req.file.originalname,
        esTodoElAño: false,
        error: true,
        añoDetectadoAutomaticamente: !!añoDelNombre
      };
    }
    
    // 🎯 DETECTAR AÑO AUTOMÁTICAMENTE USANDO LA FUNCIÓN PRINCIPAL
    const anioDetectadoDelArchivo = detectarAnioDeArchivo(req.file.path);
    console.log(`🔍 AÑO DETECTADO del archivo: ${anioDetectadoDelArchivo}`);
    
    // ✅ DECISIÓN INTELIGENTE: Usar año detectado del Excel si es diferente al parámetro
    let anioAUsar = anio; // Por defecto el año del parámetro
    let cambioDeAño = false;
    
    // Priorizar año detectado por la función principal si existe
    if (anioDetectadoDelArchivo && anioDetectadoDelArchivo.toString() !== anio) {
      anioAUsar = anioDetectadoDelArchivo.toString();
      cambioDeAño = true;
      console.log(`🔄 CAMBIO AUTOMÁTICO DE AÑO (función principal): ${anio} → ${anioAUsar} (detectado del Excel)`);
    } else if (fechaInfo && fechaInfo.año && fechaInfo.año.toString() !== anio) {
      anioAUsar = fechaInfo.año.toString();
      cambioDeAño = true;
      console.log(`🔄 CAMBIO AUTOMÁTICO DE AÑO (fechaInfo): ${anio} → ${anioAUsar} (detectado del Excel)`);
    } else if (anioDetectadoDelArchivo && anioDetectadoDelArchivo.toString() === anio) {
      console.log(`✅ AÑO COINCIDE: ${anio} (Excel y parámetro iguales)`);
    } else if (fechaInfo && fechaInfo.año && fechaInfo.año.toString() === anio) {
      console.log(`✅ AÑO COINCIDE: ${anio} (Excel y parámetro iguales)`);
    } else {
      console.log(`⚠️  USANDO AÑO DEL PARÁMETRO: ${anio} (no se detectó año del Excel)`);
    }
    
    // 📂 ORGANIZACIÓN MEJORADA: Crear subcarpeta por mes detectado
    let mesDetectado = fechaInfo?.mes;
    
    // 🔍 ESTRATEGIA MEJORADA: Detectar mes desde múltiples fuentes
    console.log('🔍 Intentando detectar mes desde nombre de archivo...');
    const mesDesdeNombre = detectarMesDeArchivo(req.file.originalname, req.file.path);
    
    // 🔍 ESTRATEGIA ADICIONAL: Si hay fecha detectada pero no mes, extraer mes de la fecha
    let mesDetectadoFinal = mesDetectado;
    
    if (mesDesdeNombre && mesDesdeNombre !== 'TODOS') {
      mesDetectadoFinal = mesDesdeNombre;
      console.log(`✅ MES DETECTADO desde nombre de archivo: ${mesDetectadoFinal}`);
    } else if (!mesDetectadoFinal || mesDetectadoFinal === 'DESCONOCIDO' || mesDetectadoFinal === 'ERROR') {
      // 🎯 NUEVA ESTRATEGIA: Buscar fechas directamente en el Excel para extraer mes
      console.log('🔍 Buscando fechas en Excel para extraer mes...');
      try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Buscar cualquier fecha en las primeras 30 filas
        for (let i = 0; i < Math.min(30, data.length); i++) {
          if (!data[i]) continue;
          for (let j = 0; j < Math.min(10, data[i].length); j++) {
            let cellValue = data[i][j];
            if (!cellValue) continue;
            
            cellValue = cellValue.toString().trim();
            
            // Buscar patrones de fecha (dd/mm/yy, dd/mm/yyyy, etc.)
            const fechaPatterns = [
              /(\d{1,2})\/(\d{1,2})\/\d{2,4}/, // dd/mm/yy o dd/mm/yyyy
              /(\d{1,2})-(\d{1,2})-\d{2,4}/,  // dd-mm-yy o dd-mm-yyyy
              /(\d{4})-(\d{1,2})-(\d{1,2})/   // yyyy-mm-dd
            ];
            
            for (const pattern of fechaPatterns) {
              const fechaMatch = cellValue.match(pattern);
              if (fechaMatch) {
                let mesNumero;
                
                // Determinar posición del mes según el patrón
                if (pattern.source.includes('(\\\\d{4})')) {
                  // yyyy-mm-dd: mes está en posición 2
                  mesNumero = parseInt(fechaMatch[2]);
                } else {
                  // dd/mm/yy o dd-mm-yy: mes está en posición 2
                  mesNumero = parseInt(fechaMatch[2]);
                }
                
                const mesesNombres = ['', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                                    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                
                if (mesNumero >= 1 && mesNumero <= 12) {
                  mesDetectadoFinal = mesesNombres[mesNumero];
                  console.log(`✅ MES EXTRAÍDO de fecha en Excel: ${cellValue} → ${mesDetectadoFinal}`);
                  break;
                }
              }
            }
            if (mesDetectadoFinal && mesDetectadoFinal !== 'DESCONOCIDO' && mesDetectadoFinal !== 'ERROR') break;
          }
          if (mesDetectadoFinal && mesDetectadoFinal !== 'DESCONOCIDO' && mesDetectadoFinal !== 'ERROR') break;
        }
             } catch (err) {
         console.log('⚠️  Error al buscar fechas en Excel:', err.message);
       }
     }
     
     // 🔍 VERIFICACIÓN FINAL
     if (!mesDetectadoFinal || mesDetectadoFinal === 'DESCONOCIDO' || mesDetectadoFinal === 'ERROR') {
       console.log('❌ No se pudo detectar mes desde ninguna fuente');
     } else {
       console.log(`✅ MES DETECTADO FINAL: ${mesDetectadoFinal}`);
     }
    
    mesDetectado = mesDetectadoFinal;
    
    let dirCorrecto;
    let archivoFinal = req.file.originalname;
    
    if (mesDetectado && mesDetectado !== 'DESCONOCIDO' && mesDetectado !== 'ERROR' && mesDetectado !== 'TODOS') {
      // 📁 CREAR CARPETA DEL MES ESPECÍFICO
      dirCorrecto = path.join(__dirname, 'data', establecimiento, categoria, anioAUsar, mesDetectado);
      console.log(`📂 ORGANIZACIÓN POR MES: ${dirCorrecto} (mes: ${mesDetectado})`);
      
      // 🔄 REEMPLAZAR ARCHIVO EXISTENTE EN EL MES (solo mantener uno por mes)
      const archivosExistentes = fs.existsSync(dirCorrecto) ? fs.readdirSync(dirCorrecto) : [];
      if (archivosExistentes.length > 0) {
        // Eliminar archivos existentes en esta carpeta de mes
        archivosExistentes.forEach(archivo => {
          const rutaArchivo = path.join(dirCorrecto, archivo);
          console.log(`🗑️  ELIMINANDO archivo anterior: ${rutaArchivo}`);
          fs.unlinkSync(rutaArchivo);
        });
      }
      
      // 🎯 SIEMPRE RENOMBRAR AL MES: No importa el nombre original, siempre usar "MES.xls"
      archivoFinal = `${mesDetectado}.xls`;
      console.log(`📝 RENOMBRANDO archivo: "${req.file.originalname}" → "${archivoFinal}"`);
      
    } else if (mesDetectado === 'TODOS') {
      // 📅 ARCHIVO DE TODO EL AÑO
      dirCorrecto = path.join(__dirname, 'data', establecimiento, categoria, anioAUsar);
      console.log(`📅 ARCHIVO TODO EL AÑO: ${dirCorrecto}`);
      archivoFinal = 'TODO_EL_AÑO.xls';
      console.log(`📝 RENOMBRANDO archivo: "${req.file.originalname}" → "${archivoFinal}"`);
      
    } else {
      // 📁 USAR CARPETA DEL AÑO DIRECTAMENTE SI NO SE DETECTA MES
      dirCorrecto = path.join(__dirname, 'data', establecimiento, categoria, anioAUsar);
      console.log(`📁 Directorio base (sin mes detectado): ${dirCorrecto}`);
      console.log(`📄 MANTENIENDO nombre original: "${req.file.originalname}"`);
    }
    
    console.log(`📁 Directorio correcto: ${dirCorrecto}`);
    
    // Crear directorio de destino
    fs.mkdirSync(dirCorrecto, { recursive: true });
    console.log('📁 Directorio creado/verificado');
    
    // 📝 DETERMINAR RUTA FINAL DEL ARCHIVO
    const rutaArchivoFinal = path.join(dirCorrecto, archivoFinal);
    
    // 🔄 MOVER/RENOMBRAR ARCHIVO SI ES NECESARIO
    if (req.file.path !== rutaArchivoFinal) {
      const archivoOriginal = req.file.path;
      
      console.log('📂 Moviendo/renombrando archivo:');
      console.log('   Desde:', archivoOriginal);
      console.log('   Hacia:', rutaArchivoFinal);
      
      // Copiar archivo con el nuevo nombre
      fs.copyFileSync(archivoOriginal, rutaArchivoFinal);
      fs.unlinkSync(archivoOriginal);
      
      // Actualizar la ruta en req.file
      req.file.path = rutaArchivoFinal;
      req.file.filename = archivoFinal;
      
      // Limpiar directorio vacío si quedó vacío
      try {
        const dirOriginal = path.dirname(archivoOriginal);
        if (dirOriginal !== dirCorrecto) {
          const archivosEnDirOriginal = fs.readdirSync(dirOriginal);
          if (archivosEnDirOriginal.length === 0) {
            fs.rmdirSync(dirOriginal);
            console.log('🧹 Directorio vacío eliminado:', dirOriginal);
          }
        }
      } catch (e) {
        console.log('⚠️  No se pudo eliminar directorio:', e.message);
      }
    }
    
    console.log('✅ Archivo guardado en:', req.file.path);
    console.log('📄 Nombre final del archivo:', archivoFinal);
    console.log('🔍 ¿Existe el archivo guardado?', fs.existsSync(req.file.path));
    
    // 🔓 LIBERAR BLOQUEO DE UPLOAD
    uploadsEnProceso.delete(uploadKey);
    console.log('🔓 Liberando bloqueo upload:', uploadKey);
    
    // 📂 GENERAR MENSAJE DESCRIPTIVO
    let mensajeFinal = 'Archivo de ranking guardado correctamente.';
    
    if (cambioDeAño) {
      mensajeFinal = `Archivo guardado en carpeta ${anioAUsar} (auto-detectado del Excel)`;
    }
    
    if (mesDetectado && mesDetectado !== 'DESCONOCIDO' && mesDetectado !== 'ERROR') {
      mensajeFinal += ` 📂 Organizado en subcarpeta: ${mesDetectado}`;
    }
    
    res.json({ 
      success: true, 
      message: mensajeFinal,
      fechaInfo: fechaInfo,
      anioDetectado: fechaInfo && fechaInfo.año ? fechaInfo.año.toString() : anio,
      anioUsado: anioAUsar,
      anioOriginal: anio,
      cambioAutomatico: cambioDeAño,
      organizadoPorMes: mesDetectado && mesDetectado !== 'DESCONOCIDO' && mesDetectado !== 'ERROR',
      mesDetectado: mesDetectado,
      archivoFinal: archivoFinal,
      ubicacionFinal: req.file.path
    });
  } catch (err) {
    console.error('❌ ERROR AL GUARDAR ARCHIVO DE RANKING:', err);
    
    // 🔓 LIBERAR BLOQUEO EN CASO DE ERROR
    const uploadKey = `${req.params.establecimiento}_${req.params.categoria}_${req.params.anio}_${req.file?.originalname || 'unknown'}`;
    uploadsEnProceso.delete(uploadKey);
    console.log('🔓 Liberando bloqueo upload (error):', uploadKey);
    
    // 🔍 DETECTAR TIPO DE ERROR Y DAR MENSAJE ESPECÍFICO
    let errorMessage = err.message;
    let errorCode = 500;
    
    if (err.code === 'EBUSY') {
      errorMessage = 'El archivo está siendo usado por otro programa. Cierra Excel y vuelve a intentar.';
      errorCode = 423; // Locked
    } else if (err.code === 'EACCES') {
      errorMessage = 'No hay permisos para acceder al archivo.';
      errorCode = 403; // Forbidden
    } else if (err.code === 'ENOENT') {
      errorMessage = 'El archivo no se encontró.';
      errorCode = 404; // Not Found
    } else if (err.code === 'EMFILE') {
      errorMessage = 'Demasiados archivos abiertos. Intenta de nuevo en unos segundos.';
      errorCode = 429; // Too Many Requests
    }
    
    res.status(errorCode).json({ 
      success: false, 
      error: errorMessage,
      detalle: `Error técnico: ${err.code || 'UNKNOWN'} - ${err.message}`,
      solucion: err.code === 'EBUSY' 
        ? 'Cierra Excel u otros programas que puedan estar usando el archivo'
        : 'Revisa que el archivo no esté dañado y vuelve a intentar'
    });
  }
});

// Listar archivos por establecimiento, categoría y año
app.get('/ranking/archivos/:establecimiento/:categoria/:anio', authenticateToken, validarAccesoEstablecimiento, (req, res) => {
  try {
    const { establecimiento, categoria, anio } = req.params;
    const dir = path.join(__dirname, 'data', establecimiento, categoria, anio);
    
    if (!fs.existsSync(dir)) return res.json({ archivos: [] });
    
    const archivos = fs.readdirSync(dir)
      .filter(f => isValidExcelFormat(f))
      .map(f => ({ archivo: f }));
    
    res.json({ archivos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Leer archivo Excel de ranking y extraer top 4 diagnósticos
app.get('/ranking/leer/:establecimiento/:categoria/:anio/:archivo', authenticateToken, validarAccesoEstablecimiento, async (req, res) => {
  try {
    const { establecimiento, categoria, anio, archivo } = req.params;
    console.log('Parámetros recibidos para ranking:', { establecimiento, categoria, anio, archivo });
    
    const filePath = path.join(__dirname, 'data', establecimiento, categoria, anio, archivo);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Archivo no encontrado.' });
    }
    
    if (!isValidExcelFormat(archivo)) {
      return res.json({ success: false, error: `Solo se permiten archivos de Excel. Formatos soportados: ${EXCEL_FORMATS.join(', ')}.` });
    }

    try {
      // Leer archivo Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log('Datos Excel leídos:', data.length, 'filas');
      
      if (data.length < 2) {
        return res.json({ success: false, error: 'El archivo Excel no tiene datos.' });
      }
      
      // Buscar la fila que contiene los headers (#, Código, Diagnóstico, Cantidad)
      let headerRowIndex = -1;
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row && row.length >= 4) {
          const hasRequiredColumns = 
            (row[0] && String(row[0]).includes('#')) &&
            (row[1] && String(row[1]).toLowerCase().includes('código')) &&
            (row[2] && String(row[2]).toLowerCase().includes('diagnóstico')) &&
            (row[3] && String(row[3]).toLowerCase().includes('cantidad'));
          
          if (hasRequiredColumns) {
            headerRowIndex = i;
            break;
          }
        }
      }
      
      if (headerRowIndex === -1) {
        return res.json({ success: false, error: 'No se encontraron las columnas requeridas (#, Código, Diagnóstico, Cantidad).' });
      }
      
      console.log('Headers encontrados en fila:', headerRowIndex);
      
      // Extraer los datos de diagnósticos (máximo 4)
      const diagnosticos = [];
      let count = 0;
      
      for (let i = headerRowIndex + 1; i < data.length && count < 4; i++) {
        const row = data[i];
        if (row && row.length >= 4) {
          const numero = row[0];
          const codigo = row[1];
          const diagnostico = row[2];
          const cantidad = row[3];
          
          // Validar que tiene datos válidos
          if (codigo && diagnostico && cantidad && 
              String(codigo).trim() !== '' && 
              String(diagnostico).trim() !== '' && 
              !isNaN(Number(cantidad))) {
            
            diagnosticos.push({
              numero: Number(numero) || (count + 1),
              codigo: String(codigo).trim(),
              diagnostico: String(diagnostico).trim(),
              cantidad: Number(cantidad)
            });
            count++;
          }
        }
      }
      
      console.log('Diagnósticos extraídos:', diagnosticos);
      
      if (diagnosticos.length === 0) {
        return res.json({ success: false, error: 'No se encontraron diagnósticos válidos en el archivo.' });
      }
      
      return res.json({ 
        success: true, 
        data: diagnosticos,
        categoria: categoria,
        establecimiento: establecimiento
      });
      
    } catch (excelErr) {
      console.error('Error al procesar Excel:', excelErr);
      return res.json({ success: false, error: 'Error al leer o parsear el archivo Excel: ' + excelErr.message });
    }
  } catch (err) {
    console.error('Error general:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analizar múltiples archivos por meses seleccionados
app.post('/ranking/analizar/:establecimiento/:categoria/:anio', authenticateToken, validarAccesoEstablecimiento, async (req, res) => {
  try {
    const { establecimiento, categoria, anio } = req.params;
    const { meses } = req.body; // Array de meses seleccionados
    
    console.log('[RANKING] Analizando ranking para:', { establecimiento, categoria, anio, meses });
    
    if (!meses || !Array.isArray(meses) || meses.length === 0) {
      return res.json({ success: false, error: 'Debe seleccionar al menos un mes.' });
    }
    
    const dirPrincipal = path.join(__dirname, 'data', establecimiento, categoria, anio);
    if (!fs.existsSync(dirPrincipal)) {
      return res.json({ success: false, error: 'No hay archivos para este establecimiento y categoría.' });
    }
    
    // 📂 BÚSQUEDA MEJORADA: Buscar archivos en subcarpetas de meses Y en carpeta principal
    const archivosEncontrados = [];
    
    // 1. Buscar en subcarpetas de meses específicos
    for (const mes of meses) {
      const dirMes = path.join(dirPrincipal, mes);
      if (fs.existsSync(dirMes)) {
        const archivosDelMes = fs.readdirSync(dirMes).filter(f => isValidExcelFormat(f));
        for (const archivo of archivosDelMes) {
          archivosEncontrados.push({
            archivo: archivo,
            rutaCompleta: path.join(dirMes, archivo),
            mes: mes,
            origen: 'subcarpeta'
          });
        }
        console.log(`📂 Encontrados ${archivosDelMes.length} archivos en subcarpeta ${mes}:`, archivosDelMes);
      }
    }
    
    // 2. Buscar en carpeta principal (archivos sin organizar por mes)
    const archivosDirectos = fs.readdirSync(dirPrincipal).filter(f => 
      isValidExcelFormat(f) && 
      fs.statSync(path.join(dirPrincipal, f)).isFile()
    );
    
    console.log(`📁 Archivos en carpeta principal (${dirPrincipal}):`, archivosDirectos);
    
    if (archivosEncontrados.length === 0 && archivosDirectos.length === 0) {
      return res.json({ success: false, error: 'No hay archivos Excel en ninguna ubicación.' });
    }
    
    // ✅ CORREGIDO: Inicializar objetos de resultados dentro de la función para cada llamada
    const resultadosPorMes = [];
    const todosLosResultados = {}; // Se reinicia en cada llamada
    const archivosEncontradosPorMes = {};
    
    // Mapa de nombres de meses
    const MESES_NOMBRES = {
      'ENERO': ['enero', 'january', '01', 'ene', 'jan'],
      'FEBRERO': ['febrero', 'february', '02', 'feb'],
      'MARZO': ['marzo', 'march', '03', 'mar'],
      'ABRIL': ['abril', 'april', '04', 'abr', 'apr'],
      'MAYO': ['mayo', 'may', '05'],
      'JUNIO': ['junio', 'june', '06', 'jun'],
      'JULIO': ['julio', 'july', '07', 'jul'],
      'AGOSTO': ['agosto', 'august', '08', 'ago', 'aug'],
      'SEPTIEMBRE': ['septiembre', 'september', '09', 'sep'],
      'OCTUBRE': ['octubre', 'october', '10', 'oct'],
      'NOVIEMBRE': ['noviembre', 'november', '11', 'nov'],
      'DICIEMBRE': ['diciembre', 'december', '12', 'dic', 'dec']
    };
    
    // ✅ USAR FUNCIÓN GLOBAL detectarMesDeArchivo (NO DUPLICAR FUNCIÓN)
    
    // 📂 PROCESAR ARCHIVOS: Tanto de subcarpetas como de carpeta principal
    const archivosParaProcesar = [];
    
    // 1. Procesar archivos ya encontrados en subcarpetas (tienen prioridad)
    for (const archivoInfo of archivosEncontrados) {
      if (meses.includes(archivoInfo.mes)) {
        archivosParaProcesar.push({
          archivo: archivoInfo.archivo,
          rutaCompleta: archivoInfo.rutaCompleta,
          mes: archivoInfo.mes,
          origen: archivoInfo.origen
        });
        
        if (!archivosEncontradosPorMes[archivoInfo.mes]) {
          archivosEncontradosPorMes[archivoInfo.mes] = [];
        }
        archivosEncontradosPorMes[archivoInfo.mes].push(archivoInfo.archivo);
        console.log(`✅ Archivo ${archivoInfo.archivo} incluido para ${archivoInfo.mes} (desde subcarpeta)`);
      }
    }
    
    // 2. Procesar archivos de carpeta principal (solo si no hay archivo en subcarpeta para ese mes)
    for (const archivo of archivosDirectos) {
      const rutaCompleta = path.join(dirPrincipal, archivo);
      const mesDetectado = detectarMesDeArchivo(archivo, rutaCompleta);
      console.log(`📁 Archivo: ${archivo} → Mes detectado: ${mesDetectado}`);
      
      if (mesDetectado && meses.includes(mesDetectado)) {
        // Solo incluir si no hay archivo en subcarpeta para este mes
        const yaExisteEnSubcarpeta = archivosEncontradosPorMes[mesDetectado]?.length > 0;
        
        if (!yaExisteEnSubcarpeta) {
          archivosParaProcesar.push({
            archivo: archivo,
            rutaCompleta: rutaCompleta,
            mes: mesDetectado,
            origen: 'principal'
          });
          
          if (!archivosEncontradosPorMes[mesDetectado]) {
            archivosEncontradosPorMes[mesDetectado] = [];
          }
          archivosEncontradosPorMes[mesDetectado].push(archivo);
          console.log(`✅ Archivo ${archivo} incluido para ${mesDetectado} (desde carpeta principal)`);
        } else {
          console.log(`⚠️  Archivo ${archivo} ignorado - ya existe archivo en subcarpeta para ${mesDetectado}`);
        }
      } else {
        console.log(`❌ Archivo ${archivo} excluido (mes: ${mesDetectado}, meses solicitados: ${meses.join(', ')})`);
      }
    }
    
    console.log('📊 Archivos encontrados por mes:', archivosEncontradosPorMes);
    console.log('📂 Archivos a procesar:', archivosParaProcesar.map(a => `${a.archivo} (${a.mes}) [${a.origen}]`));
    
    if (archivosParaProcesar.length === 0) {
      const mesesFaltantes = meses.filter(m => !archivosEncontradosPorMes[m]);
      return res.json({ 
        success: false, 
        error: `No se encontraron archivos para los meses seleccionados: ${mesesFaltantes.join(', ')}`,
        archivosDisponibles: archivosDirectos,
        subcarpetasEncontradas: archivosEncontrados.map(a => `${a.mes}/${a.archivo}`),
        mesesSolicitados: meses
      });
    }
    
    // 📊 PROCESAR ARCHIVOS FILTRADOS (tanto de subcarpetas como de carpeta principal)
    for (const { archivo, rutaCompleta, mes, origen } of archivosParaProcesar) {
      try {
        console.log(`🔍 Procesando: ${archivo} (${mes}) desde ${origen}...`);
        const workbook = XLSX.readFile(rutaCompleta);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Buscar headers
        let headerRowIndex = -1;
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          if (row && row.length >= 4) {
            const hasRequiredColumns = 
              (row[0] && String(row[0]).includes('#')) &&
              (row[1] && String(row[1]).toLowerCase().includes('código')) &&
              (row[2] && String(row[2]).toLowerCase().includes('diagnóstico')) &&
              (row[3] && String(row[3]).toLowerCase().includes('cantidad'));
            
            if (hasRequiredColumns) {
              headerRowIndex = i;
              break;
            }
          }
        }
        
        if (headerRowIndex !== -1) {
          // Extraer TODOS los diagnósticos de este archivo (no solo los primeros 4)
          const diagnosticos = [];
          let diagnosticosContados = 0;
          
          console.log(`📋 Archivo ${archivo}: Total de filas en data: ${data.length}, headerRowIndex: ${headerRowIndex}`);
          
          for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            
            // Debug: mostrar cada fila para entender qué está pasando
            if (i <= headerRowIndex + 10) { // Solo mostrar las primeras 10 filas para no saturar el log
              console.log(`🔍 Fila ${i}: [${row ? row.join(', ') : 'undefined'}]`);
            }
            
            if (row && row.length >= 4) {
              const codigo = row[1];
              const diagnostico = row[2];
              const cantidad = row[3];
              
              // Debug: mostrar por qué se rechaza una fila
              if (!codigo || !diagnostico || !cantidad) {
                if (i <= headerRowIndex + 10) {
                  console.log(`❌ Fila ${i} rechazada: codigo="${codigo}", diagnostico="${diagnostico}", cantidad="${cantidad}"`);
                }
                continue;
              }
              
              if (String(codigo).trim() === '' || String(diagnostico).trim() === '' || isNaN(Number(cantidad))) {
                if (i <= headerRowIndex + 10) {
                  console.log(`❌ Fila ${i} rechazada después de trim: codigo="${String(codigo).trim()}", diagnostico="${String(diagnostico).trim()}", cantidad="${Number(cantidad)}"`);
                }
                continue;
              }
              
              const key = String(codigo).trim();
              
              // 🔍 FILTRAR DIAGNÓSTICOS NO DESEADOS
              if (key === 'Z012' || key === 'Z760' || 
                  String(diagnostico).trim().toLowerCase().includes('examen odontologico') ||
                  String(diagnostico).trim().toLowerCase().includes('consulta para repeticion de receta')) {
                if (i <= headerRowIndex + 10) {
                  console.log(`🚫 Fila ${i} filtrada: ${key} ${String(diagnostico).trim()} excluido`);
                }
                continue;
              }
              
              const diag = {
                codigo: key,
                diagnostico: String(diagnostico).trim(),
                cantidad: Number(cantidad)
              };
              
              diagnosticos.push(diag);
              diagnosticosContados++;
              
              // Acumular para totales generales
              if (!todosLosResultados[key]) {
                todosLosResultados[key] = {
                  codigo: key,
                  diagnostico: String(diagnostico).trim(),
                  cantidad: 0,
                  archivos: [] // Rastrear de qué archivos viene
                };
              }
              todosLosResultados[key].cantidad += Number(cantidad);
              todosLosResultados[key].archivos.push(`${archivo}(${cantidad})`);
              
              console.log(`📊 Sumando ${key}: ${diagnostico} → +${cantidad} (total ahora: ${todosLosResultados[key].cantidad})`);
            } else {
              if (i <= headerRowIndex + 10) {
                console.log(`❌ Fila ${i} rechazada: row.length=${row ? row.length : 'undefined'}`);
              }
            }
          }
          
          console.log(`📊 Archivo ${archivo}: Se procesaron ${diagnosticosContados} diagnósticos válidos`);
          
          resultadosPorMes.push({
            archivo: archivo,
            mes: mes,
            diagnosticos: diagnosticos
          });
        } else {
          console.log(`❌ No se encontraron headers en archivo ${archivo}`);
        }
      } catch (fileError) {
        console.error(`Error procesando archivo ${archivo}:`, fileError);
      }
    }
    
    // Ordenar totales por cantidad y tomar top 4
    const totalesOrdenados = Object.values(todosLosResultados)
      .map(item => ({
        codigo: item.codigo,
        diagnostico: item.diagnostico,
        cantidad: item.cantidad
      })) // Limpiar el objeto
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 4);
    
    console.log('🏆 TOP 4 DIAGNÓSTICOS FINALES:');
    totalesOrdenados.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.codigo} - ${item.diagnostico}: ${item.cantidad}`);
    });
    
    return res.json({
      success: true,
      resultadosPorMes: resultadosPorMes,
      totalesGenerales: totalesOrdenados,
      archivosEncontradosPorMes: archivosEncontradosPorMes,
      mesesSolicitados: meses,
      categoria: categoria,
      establecimiento: establecimiento,
      resumen: `Se analizaron ${archivosParaProcesar.length} archivo(s) para los meses: ${Object.keys(archivosEncontradosPorMes).join(', ')}`
    });
    
  } catch (err) {
    console.error('Error al analizar ranking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🏥 ENDPOINT PARA LISTAR ESTABLECIMIENTOS
app.get('/establecimientos', (req, res) => {
  try {
    const establecimientos = {
      "Zona Norte": [
        "10 Nazareno"
      ],
      "Zona Sur": [
        "25 San Carlos"
      ]
    };
    
    res.json(establecimientos);
  } catch (err) {
    console.error('Error al obtener establecimientos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const atencionProfesionalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { establecimiento, anio, mes } = req.params;
    if (!establecimiento || !anio || !mes) {
      return cb(new Error('Faltan datos de establecimiento, año o mes'), null);
    }
    const dir = path.join(__dirname, 'data', establecimiento, 'Atencion profesional por consultorio', anio, mes);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const atencionProfesionalUpload = multer({ storage: atencionProfesionalStorage });

// Endpoint para guardar archivo de atención profesional por consultorio
app.post('/atencion-profesional/guardar/:establecimiento/:anio/:mes', atencionProfesionalUpload.single('file'), async (req, res) => {
  try {
    const { establecimiento, anio, mes } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se recibió archivo.' });
    }
    res.json({
      success: true,
      message: 'Archivo guardado correctamente.',
      ubicacion: path.join('data', establecimiento, 'Atencion profesional por consultorio', anio, mes, req.file.originalname)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para descargar archivo de atención profesional por consultorio
app.get('/atencion-profesional/descargar/:establecimiento/:anio/:mes', (req, res) => {
  const { establecimiento, anio, mes } = req.params;
  const dir = path.join(__dirname, 'data', establecimiento, 'Atencion profesional por consultorio', anio, mes);
  if (!fs.existsSync(dir)) {
    return res.status(404).json({ success: false, error: 'No existe la carpeta para ese año y mes.' });
  }
  const archivos = fs.readdirSync(dir).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));
  if (archivos.length === 0) {
    return res.status(404).json({ success: false, error: 'No hay archivos Excel para ese año y mes.' });
  }
  const archivo = archivos[0];
  const ruta = path.join(dir, archivo);
  res.download(ruta, archivo);
});

const guardiaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { establecimiento, anio, mes } = req.params;
    if (!establecimiento || !anio || !mes) {
      return cb(new Error('Faltan datos de establecimiento, año o mes'), null);
    }
    const dir = path.join(__dirname, 'data', establecimiento, 'Guardia', anio, mes);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const guardiaUpload = multer({ storage: guardiaStorage });

// Endpoint para guardar archivo de guardia
app.post('/guardia/guardar/:establecimiento/:anio/:mes', guardiaUpload.single('file'), async (req, res) => {
  try {
    const { establecimiento, anio, mes } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se recibió archivo.' });
    }
    res.json({
      success: true,
      message: 'Archivo de guardia guardado correctamente.',
      ubicacion: path.join('data', establecimiento, 'Guardia', anio, mes, req.file.originalname)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para descargar archivo de guardia
app.get('/guardia/descargar/:establecimiento/:anio/:mes', (req, res) => {
  const { establecimiento, anio, mes } = req.params;
  const dir = path.join(__dirname, 'data', establecimiento, 'Guardia', anio, mes);
  if (!fs.existsSync(dir)) {
    return res.status(404).json({ success: false, error: 'No existe la carpeta para ese año y mes.' });
  }
  const archivos = fs.readdirSync(dir).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));
  if (archivos.length === 0) {
    return res.status(404).json({ success: false, error: 'No hay archivos Excel para ese año y mes.' });
  }
  const archivo = archivos[0];
  const ruta = path.join(dir, archivo);
  res.download(ruta, archivo);
});

// Catch-all handler: SOLO para rutas que NO son archivos estáticos
app.get('*', (req, res) => {
  // NO servir index.html para archivos estáticos
  if (req.url.startsWith('/static/') || 
      req.url.endsWith('.js') || 
      req.url.endsWith('.css') || 
      req.url.endsWith('.map') ||
      req.url.endsWith('.ico') ||
      req.url.endsWith('.png') ||
      req.url.endsWith('.json')) {
    return res.status(404).send('File not found');
  }
  
  // Solo para rutas de React
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(5001, () => {
  console.log('Backend Excel server running on port 5001');
  console.log('Frontend available at: https://tablero-control-1.onrender.com');
}); 