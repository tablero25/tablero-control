import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import GaugeChart from 'react-gauge-chart';
import * as XLSX from 'xlsx';
// import logoSDO from './logoo.png'; // Comentado temporalmente
import Login from './Login';
import Register from './Register';
import ChangePassword from './ChangePassword';
import Configuracion from './Configuracion';
import ConfirmEmail from './ConfirmEmail';

// Suprimir warnings de ResizeObserver en desarrollo
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Utilidad para fetch con token
function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers || {};
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return fetch(url, { ...options, headers });
}

// Componente GaugeChart mejorado para evitar errores de ResizeObserver
const SafeGaugeChart = ({ percent, ...props }) => {
  return (
    <div style={{ width: '200px', height: '120px', margin: '0 auto' }}>
      <GaugeChart
        percent={percent}
        {...props}
      />
    </div>
  );
};

// Componente del logo de Salta
// const SaltaLogo = () => (
//   <img src={logoSDO} alt="Logo SDO" style={{height: '40px'}} />
// );

// Lista de meses del año
const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

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
const isValidExcelFormat = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  const ext = filename.toLowerCase().split('.').pop();
  return EXCEL_FORMATS.some(format => format === `.${ext}`);
};

// Función para obtener la lista de formatos para el atributo accept
const getExcelAcceptAttribute = () => {
  return EXCEL_FORMATS.filter(f => f !== '.txt').join(','); // Excluir .txt para evitar confusiones
};

// Función para obtener los días del mes
const getDiasDelMes = (mes, anio) => {
  const mesesNum = MESES.indexOf(mes) + 1;
  return new Date(anio, mesesNum, 0).getDate();
};

// Función para formatear la fórmula de camas disponibles
const formatearCamasDisponibles = (camdis, mes, anio) => {
  if (!camdis || camdis === 0) return "0";
  const dias = getDiasDelMes(mes, anio);
  const resultado = (camdis / dias).toFixed(2);
  return `${camdis}/${dias} = ${resultado}`;
};

const ZONAS = [
  {
    nombre: 'ZONA CENTRO',
    establecimientos: [
      '47 Materno Infantil', '40 San Bernardo', '55 Papa Francisco', '41 Señor Del Milagro',
      '43 Oñativia', '42 Ragone', '45 P.N.A. zona norte', '56 P.N.A. zona sur',
      'Centro de Rehabilitación', 'Oncologia', 'Adicciones', 'CUCAI', 'Samec'
    ]
  },
  {
    nombre: 'ZONA NORTE',
    establecimientos: [
      '1 Colonia Sta. Rosa', '2 Pichanal', '3 Aguaray', '4 Morillo', '7 P. Salvador Maza',
      '8 Sta. Victoria Este', '9 Embarcación', '11 Oran', '12 Tartagal', '13 Rivadavia',
      '28 Gral. Enrique Mosconi', '31 Hipólito Yrigoyen', '44 Alto  la Sierra', '49 Urundel', '51 La Unión'
    ]
  },
  {
    nombre: 'ZONA SUR',
    establecimientos: [
      '14 Las Lajitas', '15 J. V. González', '16 El Quebrachal', '17 El Galpón',
      '18 Rosario de la Frontera', '19 Metan', '21 El Tala', '22 Gral. Güemes',
      '23 Apolinario Saravia', '38 El Potrero'
    ]
  },
  {
    nombre: 'ZONA OESTE',
    establecimientos: [
      '5 Sta. Victoria Oeste', '6 Iruya', '10 Nazareno', '24 Cafayate', '25 San Carlos',
      '26 Molinos', '27 Cachi', '29 San Antonio de los Cobres', '30 Cerrillos',
      '32 Rosario de Lerma', '33 Chicoana', '34 El Carril', '35 Cnel. Moldes',
      '36 La Viña', '37 Guachipas', '39 La Caldera', '46 Campo Quijano',
      '48 Seclantas', '50 La Merced', '52 La Poma', '53 Angastaco'
    ]
  }
];

// Página principal con los tres cuadros
function Home({ user }) {
  const navigate = useNavigate();

  // Filtrado de establecimientos según el rol
  const getEstablecimientosPorZona = () => {
    if (!user || user.role === 'ADMIN' || user.role === 'DIRECTOR') {
      return ZONAS;
    }
    if (user.role === 'JEFE_ZONA' || user.role === 'GERENTE') {
      const asignados = (user.establecimientos || []);
      const asignadosNombres = asignados.map(e =>
        (typeof e === 'string' ? e.toLowerCase().trim() : e.nombre.toLowerCase().trim())
      );
      return ZONAS.map(zona => ({
        nombre: zona.nombre,
        establecimientos: zona.establecimientos.filter(est =>
          asignadosNombres.includes(est.toLowerCase().trim())
        )
      })).filter(zona => zona.establecimientos.length > 0);
    }
    return [];
  };

  const zonasFiltradas = getEstablecimientosPorZona();

  // Renderiza un cuadro con los establecimientos agrupados
  const renderCuadro = (titulo, rutaBase) => (
    <div className="box" style={{cursor:'pointer', minWidth: 320}}>
      <h2>{titulo}</h2>
      <div className="zonas-grid-home">
        {zonasFiltradas.map(zona => (
          <div key={zona.nombre} className="zona-col">
            <div className="zona-titulo">{zona.nombre}</div>
            <div className="zona-establecimientos">
              {zona.establecimientos.map(est => (
                <button
                  key={est}
                  className="establecimiento-btn"
                  onClick={() => navigate(`/sistema-tablero/${rutaBase}/${encodeURIComponent(est)}`)}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tablero-bg">
      <div className="container" style={{display:'flex', gap:24, flexWrap:'wrap', justifyContent:'center'}}>
        {renderCuadro('PRODUCCIÓN INTERNACIÓN', 'indicadores-camas')}
        {renderCuadro('PRODUCCIÓN CONSULTA AMBULATORIA', 'atencion-medica')}
        {renderCuadro('RANKING DE DIAGNÓSTICO', 'ranking-diagnostico')}
      </div>
    </div>
  );
}

// Pantalla solo selector de establecimiento
function IndicadoresCamas({ user }) {
  const navigate = useNavigate();
  let establecimientosPorZona = [];
  
  if (user && (user.role === 'JEFE_ZONA' || user.role === 'GERENTE')) {
    const asignados = (user.establecimientos || []);
    const asignadosNombres = asignados.map(e =>
      (typeof e === 'string' ? e.toLowerCase().trim() : e.nombre.toLowerCase().trim())
    );
    
    ZONAS.forEach(zona => {
      const ests = zona.establecimientos.filter(est => {
        const estLower = est.toLowerCase().trim();
        return asignadosNombres.includes(estLower);
      });
      if (ests.length > 0) {
        establecimientosPorZona.push({ nombre: zona.nombre, establecimientos: ests });
      }
    });
  } else {
    establecimientosPorZona = ZONAS;
  }
  return (
    <div className="tablero-bg">
      <div style={{textAlign:'center', padding:'30px 0', color:'#fff'}}>
        <h2 style={{fontSize:'2rem', margin:0}}>PRODUCCIÓN INTERNACIÓN</h2>
        <p>Seleccione un establecimiento para ver los datos o cargue archivos si es la primera vez.</p>
      </div>
      <div className="zonas-grid">
        {establecimientosPorZona && establecimientosPorZona.length > 0 ? (
          establecimientosPorZona.map(zona => (
            <div key={zona.nombre} className="zona-col">
              <div className="zona-titulo">{zona.nombre}</div>
              <div className="zona-establecimientos">
                {zona.establecimientos.map(est => (
                  <button
                    key={est}
                    className="establecimiento-btn"
                    onClick={() => navigate(`/indicadores-camas/${encodeURIComponent(est)}`)}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{color:'#fff', textAlign:'center', marginTop:40}}>No hay zonas configuradas.</div>
        )}
      </div>
    </div>
  );
}

// Pantalla específica de establecimiento para INDICADORES CAMAS
function IndicadoresCamasEstablecimiento({ user }) {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const nombreEstablecimiento = decodeURIComponent(nombre);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [datos, setDatos] = useState(null);
  const [totalTurnos, setTotalTurnos] = useState(null);
  const [totalGuardia, setTotalGuardia] = useState(null);
  const [todos, setTodos] = useState(false);

  const handleMesChange = (mes) => {
    if (mes === 'TODOS') {
      if (todos) {
        setMesesSeleccionados([]);
        setTodos(false);
      } else {
        setMesesSeleccionados([...MESES]);
        setTodos(true);
      }
    } else {
      let nuevos;
      if (mesesSeleccionados.includes(mes)) {
        nuevos = mesesSeleccionados.filter(m => m !== mes);
      } else {
        nuevos = [...mesesSeleccionados, mes];
      }
      setMesesSeleccionados(nuevos);
      setTodos(nuevos.length === MESES.length);
    }
  };

  const handleArchivo = (e) => {
    // Solo tomar el primer archivo seleccionado (un archivo por mes)
    setArchivo(e.target.files.length > 0 ? e.target.files[0] : null);
  };

  const handleGuardar = async () => {
    setMensaje("");
    setError("");
    if (!anio) {
      setError("Debe ingresar un año válido.");
      return;
    }
    if (!mesesSeleccionados.length) {
      setError("Debe seleccionar al menos un mes.");
      return;
    }
    if (!archivo) {
      setError("Debe seleccionar al menos un archivo.");
      return;
    }
    
    setGuardando(true);
    try {
      
      // Guardar archivo de atención profesional (un archivo por mes)
      if (archivo) {
        for (const mes of mesesSeleccionados) {
          const formData = new FormData();
          formData.append('file', archivo);
          const url = `https://tablero-control-1.onrender.com/atencion-profesional/guardar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
          const response = await fetchWithAuth(url, {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (!result.success) {
            setError(result.error || 'Error al guardar el archivo de atención profesional.');
            setGuardando(false);
            return;
          }
        }
      }

      // Guardar archivo de guardia (un archivo por mes)
      if (archivo) {
        for (const mes of mesesSeleccionados) {
          const formData = new FormData();
          formData.append('file', archivo);
          const url = `https://tablero-control-1.onrender.com/guardia/guardar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
          const response = await fetchWithAuth(url, {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (!result.success) {
            setError(result.error || 'Error al guardar el archivo de guardia.');
            setGuardando(false);
            return;
          }
        }
      }

      setMensaje("Archivo(s) guardado(s) correctamente.");
      setArchivo(null);
      setMesesSeleccionados([]);
      setTodos(false);
      
      // Extraer totales automáticamente para todos los meses seleccionados
      if (mesesSeleccionados.length > 0) {
        await extraerTotales(mesesSeleccionados);
      }
      
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
    setGuardando(false);
  };

  const handleAlmacenar = async () => {
    setMensaje("");
    setError("");
    if (!anio) {
      setError("Debe ingresar un año válido.");
      return;
    }
    if (!mesesSeleccionados.length) {
      setError("Debe seleccionar al menos un mes.");
      return;
    }
    
    setGuardando(true);
    try {
      // Extraer totales automáticamente para todos los meses seleccionados
      if (mesesSeleccionados.length > 0) {
        await extraerTotales(mesesSeleccionados);
      }
      
    } catch (err) {
      setError("Error al almacenar los datos.");
    }
    setGuardando(false);
  };

  const extraerTotales = async (meses) => {
    try {
      // Esperar un momento para que los archivos se guarden completamente
      await new Promise(resolve => setTimeout(resolve, 1500)); // Esperar 1.5 segundos
      
      let totalTurnosAcumulado = 0;
      let totalGuardiaAcumulado = 0;
      
      // Procesar cada mes seleccionado
      for (const mes of meses) {
        // Extraer total de atención profesional para este mes
        const urlProfesional = `https://tablero-control-1.onrender.com/atencion-profesional/descargar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
        const responseProfesional = await fetchWithAuth(urlProfesional);
        if (responseProfesional.ok) {
          const blobProfesional = await responseProfesional.blob();
          const fileProfesional = new File([blobProfesional], 'atencion.xlsx');
          const totalMes = await procesarArchivo(fileProfesional, 'turnos atendidos', () => {});
          totalTurnosAcumulado += totalMes || 0;
        }

        // Extraer total de guardia para este mes
        const urlGuardia = `https://tablero-control-1.onrender.com/guardia/descargar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
        const responseGuardia = await fetchWithAuth(urlGuardia);
        if (responseGuardia.ok) {
          const blobGuardia = await responseGuardia.blob();
          const fileGuardia = new File([blobGuardia], 'guardia.xlsx');
          const totalMes = await procesarArchivoGuardia(fileGuardia, () => {});
          totalGuardiaAcumulado += totalMes || 0;
        }
      }
      
      // Establecer los totales acumulados
      setTotalTurnos(totalTurnosAcumulado);
      setTotalGuardia(totalGuardiaAcumulado);
      
    } catch (err) {
      console.error('Error al extraer totales:', err);
    }
  };

  const procesarArchivo = (file, columnaBuscar, setTotal) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            setTotal(0);
            resolve(0);
            return;
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Mejorada: Solo sumar la primera sección encontrada
          if (columnaBuscar.toLowerCase().includes('atención médica por consulta')) {
            let total = 0;
            let encontrado = false;
            let seccionProcesada = false;
            
            for (let i = 0; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (row && Array.isArray(row)) {
                for (let j = 0; j < row.length; j++) {
                  const cellValue = String(row[j] || '').toLowerCase();
                  if ((cellValue.includes('atención médica') || cellValue.includes('atencion medica') || cellValue.includes('médica') || cellValue.includes('medica')) && 
                      (cellValue.includes('consulta') || cellValue.includes('por consulta')) && !seccionProcesada) {
                    encontrado = true;
                    seccionProcesada = true;
                    
                    // Buscar la columna "Cantidad de Atenciones" en la siguiente fila
                    let columnaCantidad = -1;
                    if (i + 1 < jsonData.length) {
                      const nextRow = jsonData[i + 1];
                      if (nextRow && Array.isArray(nextRow)) {
                        for (let k = 0; k < nextRow.length; k++) {
                          const headerValue = String(nextRow[k] || '').toLowerCase();
                          if (headerValue.includes('cantidad de atenciones') || headerValue.includes('cantidad') || 
                              headerValue.includes('atenciones') || headerValue.includes('total') || headerValue.includes('cant')) {
                            columnaCantidad = k;
                            break;
                          }
                        }
                      }
                    }
                    
                    if (columnaCantidad !== -1) {
                      for (let k = i + 2; k < jsonData.length; k++) { // Empezar desde i + 2 (después del header)
                        const dataRow = jsonData[k];
                        if (!dataRow || !Array.isArray(dataRow)) continue;
                        // Detener si es TOTAL o SUMA
                        const primeraColumna = String(dataRow[0] || '').toLowerCase();
                        if (primeraColumna.includes('total') || primeraColumna.includes('suma')) {
                          break;
                        }
                        // Sumar solo si es número válido
                        const val = Number(String(dataRow[columnaCantidad]).replace(/[^\d.-]/g, ''));
                        if (!isNaN(val) && val !== null && val !== undefined && String(dataRow[columnaCantidad]).trim() !== '') {
                          total += val;
                        }
                      }
                    }
                    break; // Solo la primera sección
                  }
                }
                if (encontrado) break;
              }
            }
            
            setTotal(total);
            resolve(total);
          } else if (columnaBuscar.toLowerCase().includes('turnos atendidos')) {
            // Procesamiento específico para "Turnos atendidos"
            let colIdx = -1;
            
            // Buscar en las primeras filas por cualquier columna que contenga "turnos"
            for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
              const row = jsonData[i];
              if (row && Array.isArray(row)) {
                for (let j = 0; j < row.length; j++) {
                  const cellValue = String(row[j] || '').toLowerCase();
                  if (cellValue.includes('turnos') && (cellValue.includes('atendidos') || cellValue.includes('atend'))) {
                    colIdx = j;
                    break;
                  }
                }
                if (colIdx !== -1) break;
              }
            }
            
            if (colIdx !== -1) {
              let total = 0;
              for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row && row[colIdx] !== undefined && row[colIdx] !== null && row[colIdx] !== '') {
                  const val = Number(String(row[colIdx]).replace(/[^\d.-]/g, ''));
                  if (!isNaN(val) && val > 0) {
                    total += val;
                  }
                }
              }
              setTotal(total);
              resolve(total);
            } else {
              setTotal(0);
              resolve(0);
            }
          } else {
            // Procesamiento original para otros tipos de archivos
            let colIdx = -1;
            for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
              const row = jsonData[i];
              if (row && Array.isArray(row)) {
                for (let j = 0; j < row.length; j++) {
                  const cellValue = String(row[j] || '').toLowerCase();
                  if (cellValue.includes(columnaBuscar.toLowerCase())) {
                    colIdx = j;
                    break;
                  }
                }
                if (colIdx !== -1) break;
              }
            }
            if (colIdx !== -1) {
              let total = 0;
              for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row && row[colIdx] !== undefined && row[colIdx] !== null && row[colIdx] !== '') {
                  const val = Number(String(row[colIdx]).replace(/[^\d.-]/g, ''));
                  if (!isNaN(val)) {
                    total += val;
                  }
                }
              }
              setTotal(total);
              resolve(total);
            } else {
              setTotal(0);
              resolve(0);
            }
          }
        } catch (err) {
          console.error('Error al procesar archivo:', err);
          setTotal(0);
          resolve(0);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const procesarArchivoGuardia = (file, setTotal) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          
          // Intentar diferentes opciones de lectura
          let workbook;
          try {
            workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
          } catch (e1) {
            try {
              workbook = XLSX.read(data, { type: 'array', codepage: 1252 });
            } catch (e2) {
              workbook = XLSX.read(data, { type: 'array' });
            }
          }
          
          if (workbook.SheetNames.length === 0) {
            setTotal(0);
            resolve(0);
            return;
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Intentar diferentes métodos de conversión
          let jsonData;
          try {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          } catch (err) {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
          }
          
          // NUEVA LÓGICA SIMPLE: Contar registros con diagnóstico
          let total = 0;
          let columnaDiagnostico = -1;
          
          // Buscar la columna de diagnóstico en las primeras filas
          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && Array.isArray(row)) {
              for (let j = 0; j < row.length; j++) {
                const cellValue = String(row[j] || '').toLowerCase().trim();
                if (cellValue.includes('diagnostico') || cellValue.includes('diagnóstico')) {
                  columnaDiagnostico = j;
                  break;
                }
              }
              if (columnaDiagnostico !== -1) break;
            }
          }
          
          if (columnaDiagnostico === -1) {
            setTotal(0);
            resolve(0);
            return;
          }
          
          // Contar todas las filas que tengan algo escrito en la columna de diagnóstico
          for (let k = 1; k < jsonData.length; k++) { // Empezar desde fila 1 (saltar header)
            const dataRow = jsonData[k];
            if (!dataRow || !Array.isArray(dataRow)) continue;
            
            // Si la fila está completamente vacía, continuar
            if (!dataRow.some(cell => cell && String(cell).trim() !== '')) {
              continue;
            }
            
            // Saltar filas que contengan headers (como "DIAGNOSTICO", "APELLIDO", "NOMBRE", etc.)
            const primeraColumna = String(dataRow[0] || '').toLowerCase().trim();
            if (primeraColumna === 'diagnostico' || primeraColumna === 'diagnóstico' || 
                primeraColumna === 'apellido' || primeraColumna === 'nombre' || 
                primeraColumna === 'dni' || primeraColumna === 'fecha desde' || 
                primeraColumna === 'fecha hasta' || primeraColumna === 'reporte emergencias') {
              continue;
            }
            
            // Verificar si hay diagnóstico en la columna correspondiente
            const diagnostico = String(dataRow[columnaDiagnostico] || '').trim();
            if (diagnostico !== '' && diagnostico !== 'VACÍO' && diagnostico !== 'N/A' && diagnostico !== 'null') {
              total++;
            }
          }
          
          setTotal(total);
          resolve(total);
          
        } catch (err) {
          console.error('Error al procesar archivo de guardia:', err);
          setTotal(0);
          resolve(0);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="tablero-bg">
      <div className="panel" style={{maxWidth:900,margin:'40px auto',marginTop:40}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{color:'#223366',textTransform:'uppercase',fontWeight:'bold',fontSize:'1.3rem',margin:0}}>{nombreEstablecimiento}</h2>
          <button className="analizar-btn" style={{padding:'6px 14px',fontSize:'0.9rem',marginLeft:16}} onClick={()=>navigate('/indicadores-camas')}>VOLVER</button>
        </div>
        <div className="form-group" style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
          <label>AÑO</label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="anio-input"
            style={{width:100, fontSize:'1.1rem', padding:'6px', borderRadius:6, border:'1px solid #b0b8d1'}}
          />
        </div>
        <div className="form-group">
          <label>MESES</label>
          <div className="meses-lista">
            <label className="mes-checkbox">
              <input
                type="checkbox"
                checked={todos}
                onChange={()=>handleMesChange('TODOS')}
              />
              TODOS
            </label>
            {MESES.map(mes => (
              <label key={mes} className="mes-checkbox">
                <input
                  type="checkbox"
                  checked={mesesSeleccionados.includes(mes)}
                  onChange={() => handleMesChange(mes)}
                  disabled={todos}
                />
                {mes}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group archivo-group" style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <label style={{fontWeight:'bold',marginRight:8}}>EXAMINAR</label>
          <input type="file" accept=".xlsx,.xls,.xlsm,.xlsb,.xlt,.xltx,.xltm,.ods,.fods,.csv,.txt,.rtf,.html,.htm,.xml,.sylk,.slk,.dif,.prn,.dbf,.wk1,.wk3,.wk4,.123,.wb1,.wb2,.wb3,.qpw,.numbers" onChange={handleArchivo} />
          {archivo && (
            <div style={{marginLeft:8,fontSize:'0.9rem',color:'#666'}}>
              {archivo.name}
            </div>
          )}
          <span style={{fontWeight:'bold',marginLeft:8}}>CONSULTA EXT. MEDICO</span>
        </div>
        <div className="form-group archivo-group" style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <label style={{fontWeight:'bold',marginRight:8}}>EXAMINAR</label>
          <input type="file" accept=".xlsx,.xls,.xlsm,.xlsb,.xlt,.xltx,.xltm,.ods,.fods,.csv,.txt,.rtf,.html,.htm,.xml,.sylk,.slk,.dif,.prn,.dbf,.wk1,.wk3,.wk4,.123,.wb1,.wb2,.wb3,.qpw,.numbers" onChange={handleArchivo} />
          {archivo && (
            <div style={{marginLeft:8,fontSize:'0.9rem',color:'#666'}}>
              {archivo.name}
            </div>
          )}
          <span style={{fontWeight:'bold',marginLeft:8}}>CONSULTA GUARDIA</span>
        </div>

        <div style={{display:'flex',gap:16,marginTop:24,justifyContent:'center'}}>
          <button className="analizar-btn" style={{padding:'6px 20px', fontSize:'0.9rem', minWidth:80}} onClick={handleGuardar} disabled={guardando}>{guardando ? 'PROCESANDO...' : 'GUARDAR'}</button>
          <button className="analizar-btn" style={{padding:'6px 20px', fontSize:'0.9rem', minWidth:80}} onClick={handleAlmacenar} disabled={guardando}>{guardando ? 'PROCESANDO...' : 'ALMACENAR'}</button>
        </div>
        {(totalTurnos !== null || totalGuardia !== null) && (
          <div style={{display:'flex',gap:20,marginTop:24,justifyContent:'center',flexWrap:'wrap'}}>
            {totalTurnos !== null && (
              <div style={{background:'#f8fafd', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'15px 25px', minWidth:280, textAlign:'center', fontWeight:'bold', color:'#223366', fontSize:'1.1rem'}}>
                CONSULTA EXT. MEDICO<br />
                <span style={{fontSize:'1.8rem', color:'#4a90e2'}}>{totalTurnos}</span>
              </div>
            )}
            {totalGuardia !== null && (
              <div style={{background:'#f8fafd', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'15px 25px', minWidth:280, textAlign:'center', fontWeight:'bold', color:'#223366', fontSize:'1.1rem'}}>
                CONSULTA GUARDIA<br />
                <span style={{fontSize:'1.8rem', color:'#4a90e2'}}>{totalGuardia}</span>
              </div>
            )}
            {totalTurnos !== null && totalGuardia !== null && totalGuardia !== 0 && (
              <div style={{background:'#f0f8ff', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'15px 25px', minWidth:280, textAlign:'center', fontWeight:'bold', color:'#223366', fontSize:'1.1rem', border:'2px solid #4a90e2'}}>
                CST.EXT/GUARDIA<br />
                <div className="gauge-indicador">
                  {(() => {
                    const ratio = totalTurnos / totalGuardia;
                    const maxValue = 10;
                    const clampedRatio = Math.min(ratio, maxValue);
                    // Invertir el percent para que 0 esté a la izquierda y 10 a la derecha
                    const percent = 1 - (clampedRatio / maxValue);
                    
                    return (
                      <>
                        <SafeGaugeChart
                          id="gauge-ratio-profesional-guardia"
                          nrOfLevels={100}
                          arcsLength={[0.25, 0.75]}
                          colors={['#ff4136', '#2ecc40']}
                          percent={percent}
                          arcPadding={0.02}
                          textColor="#223366"
                          formatTextValue={value => `${ratio.toFixed(2)}`}
                        />
                        <div className="gauge-label">RATIO PROFESIONAL/GUARDIA</div>
                        <div style={{
                          fontSize:'0.9rem', 
                          fontWeight:'bold', 
                          color: ratio >= 2.5 ? '#2ecc40' : '#ff4136',
                          textTransform: 'uppercase',
                          marginTop: '5px'
                        }}>
                          {ratio >= 2.5 ? '✅ Óptimo' : '⚠️ Bajo'}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
        {mensaje && <div className="success-msg">{mensaje}</div>}
        {error && <div className="error-msg">{error}</div>}

      </div>
    </div>
  );
}

// Pantalla específica de establecimiento para ATENCION MEDICA
function AtencionMedica({ user }) {
  const navigate = useNavigate();
  let establecimientosPorZona = [];
  
  if (user && (user.role === 'JEFE_ZONA' || user.role === 'GERENTE')) {
    const asignados = (user.establecimientos || []);
    const asignadosNombres = asignados.map(e =>
      (typeof e === 'string' ? e.toLowerCase().trim() : e.nombre.toLowerCase().trim())
    );
    
    ZONAS.forEach(zona => {
      const ests = zona.establecimientos.filter(est => {
        const estLower = est.toLowerCase().trim();
        return asignadosNombres.includes(estLower);
      });
      if (ests.length > 0) {
        establecimientosPorZona.push({ nombre: zona.nombre, establecimientos: ests });
      }
    });
  } else {
    establecimientosPorZona = ZONAS;
  }
  return (
    <div className="tablero-bg">
      <div style={{textAlign:'center', padding:'30px 0', color:'#fff'}}>
        <h2 style={{fontSize:'2rem', margin:0}}>PRODUCCIÓN CONSULTA AMBULATORIA</h2>
        <p>Seleccione un establecimiento para ver los datos o cargue archivos si es la primera vez.</p>
      </div>
      <div className="zonas-grid">
        {establecimientosPorZona && establecimientosPorZona.length > 0 ? (
          establecimientosPorZona.map(zona => (
            <div key={zona.nombre} className="zona-col">
              <div className="zona-titulo">{zona.nombre}</div>
              <div className="zona-establecimientos">
                {zona.establecimientos.map(est => (
                  <button
                    key={est}
                    className="establecimiento-btn"
                    onClick={() => navigate(`/atencion-medica/${encodeURIComponent(est)}`)}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{color:'#fff', textAlign:'center', marginTop:40}}>No hay zonas configuradas.</div>
        )}
      </div>
    </div>
  );
}

// Pantalla específica de establecimiento para ATENCION MEDICA (ahora layout con Outlet)
function AtencionMedicaEstablecimiento({ user }) {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const nombreEstablecimiento = decodeURIComponent(nombre);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [archivoGuardia, setArchivoGuardia] = useState(null);
  const [todos, setTodos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [totalTurnos, setTotalTurnos] = useState(null);
  const [totalGuardia, setTotalGuardia] = useState(null);

  const handleMesChange = (mes) => {
    if (mes === 'TODOS') {
      if (todos) {
        setMesesSeleccionados([]);
        setTodos(false);
      } else {
        setMesesSeleccionados([...MESES]);
        setTodos(true);
      }
    } else {
      let nuevos;
      if (mesesSeleccionados.includes(mes)) {
        nuevos = mesesSeleccionados.filter(m => m !== mes);
      } else {
        nuevos = [...mesesSeleccionados, mes];
      }
      setMesesSeleccionados(nuevos);
      setTodos(nuevos.length === MESES.length);
    }
  };

  const handleArchivo = (e) => {
    // Solo tomar el primer archivo seleccionado (un archivo por mes)
    setArchivo(e.target.files.length > 0 ? e.target.files[0] : null);
  };

  const handleArchivoGuardia = (e) => {
    // Solo tomar el primer archivo seleccionado (un archivo por mes)
    setArchivoGuardia(e.target.files.length > 0 ? e.target.files[0] : null);
  };

  const handleGuardar = async () => {
    setMensaje("");
    setError("");
    if (!anio) {
      setError("Debe ingresar un año válido.");
      return;
    }
    if (!mesesSeleccionados.length) {
      setError("Debe seleccionar al menos un mes.");
      return;
    }
    if (!archivo && !archivoGuardia) {
      setError("Debe seleccionar al menos un archivo.");
      return;
    }
    
    setGuardando(true);
    try {
      
      // Guardar archivo de atención profesional (un archivo por mes)
      if (archivo) {
        for (const mes of mesesSeleccionados) {
          const formData = new FormData();
          formData.append('file', archivo);
          const url = `https://tablero-control-1.onrender.com/atencion-profesional/guardar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
          const response = await fetchWithAuth(url, {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (!result.success) {
            setError(result.error || 'Error al guardar el archivo de atención profesional.');
            setGuardando(false);
            return;
          }
        }
      }

      // Guardar archivo de guardia (un archivo por mes)
      if (archivoGuardia) {
        for (const mes of mesesSeleccionados) {
          const formData = new FormData();
          formData.append('file', archivoGuardia);
          const url = `https://tablero-control-1.onrender.com/guardia/guardar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
          const response = await fetchWithAuth(url, {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (!result.success) {
            setError(result.error || 'Error al guardar el archivo de guardia.');
            setGuardando(false);
            return;
          }
        }
      }

      setMensaje("Archivo(s) guardado(s) correctamente.");
      setArchivo(null);
      setArchivoGuardia(null);
      setMesesSeleccionados([]);
      setTodos(false);
      
      // Extraer totales automáticamente para todos los meses seleccionados
      if (mesesSeleccionados.length > 0) {
        await extraerTotales(mesesSeleccionados);
      }
      
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
    setGuardando(false);
  };

  const handleAlmacenar = async () => {
    setMensaje("");
    setError("");
    if (!anio) {
      setError("Debe ingresar un año válido.");
      return;
    }
    if (!mesesSeleccionados.length) {
      setError("Debe seleccionar al menos un mes.");
      return;
    }
    
    setGuardando(true);
    try {
      // Extraer totales automáticamente para todos los meses seleccionados
      if (mesesSeleccionados.length > 0) {
        await extraerTotales(mesesSeleccionados);
      }
      
    } catch (err) {
      setError("Error al almacenar los datos.");
    }
    setGuardando(false);
  };

  const extraerTotales = async (meses) => {
    setTotalTurnos(null);
    setTotalGuardia(null);
    
    try {
      // Esperar un momento para que los archivos se guarden completamente
      await new Promise(resolve => setTimeout(resolve, 1500)); // Esperar 1.5 segundos
      
      let totalTurnosAcumulado = 0;
      let totalGuardiaAcumulado = 0;
      
      // Procesar cada mes seleccionado
      for (const mes of meses) {
        // Extraer total de atención profesional para este mes
        const urlProfesional = `https://tablero-control-1.onrender.com/atencion-profesional/descargar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
        const responseProfesional = await fetchWithAuth(urlProfesional);
        if (responseProfesional.ok) {
          const blobProfesional = await responseProfesional.blob();
          const fileProfesional = new File([blobProfesional], 'atencion.xlsx');
          const totalMes = await procesarArchivo(fileProfesional, 'turnos atendidos', () => {});
          totalTurnosAcumulado += totalMes || 0;
        }

        // Extraer total de guardia para este mes
        const urlGuardia = `https://tablero-control-1.onrender.com/guardia/descargar/${encodeURIComponent(nombreEstablecimiento)}/${anio}/${encodeURIComponent(mes)}`;
        const responseGuardia = await fetchWithAuth(urlGuardia);
        if (responseGuardia.ok) {
          const blobGuardia = await responseGuardia.blob();
          const fileGuardia = new File([blobGuardia], 'guardia.xlsx');
          const totalMes = await procesarArchivoGuardia(fileGuardia, () => {});
          totalGuardiaAcumulado += totalMes || 0;
        }
      }
      
      // Establecer los totales acumulados
      setTotalTurnos(totalTurnosAcumulado);
      setTotalGuardia(totalGuardiaAcumulado);
      
    } catch (err) {
      console.error('Error al extraer totales:', err);
    }
  };

  const procesarArchivo = (file, columnaBuscar, setTotal) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            setTotal(0);
            resolve(0);
            return;
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Mejorada: Solo sumar la primera sección encontrada
          if (columnaBuscar.toLowerCase().includes('atención médica por consulta')) {
            let total = 0;
            let encontrado = false;
            let seccionProcesada = false;
            
            for (let i = 0; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (row && Array.isArray(row)) {
                for (let j = 0; j < row.length; j++) {
                  const cellValue = String(row[j] || '').toLowerCase();
                  if ((cellValue.includes('atención médica') || cellValue.includes('atencion medica') || cellValue.includes('médica') || cellValue.includes('medica')) && 
                      (cellValue.includes('consulta') || cellValue.includes('por consulta')) && !seccionProcesada) {
                    encontrado = true;
                    seccionProcesada = true;
                    
                    // Buscar la columna "Cantidad de Atenciones" en la siguiente fila
                    let columnaCantidad = -1;
                    if (i + 1 < jsonData.length) {
                      const nextRow = jsonData[i + 1];
                      if (nextRow && Array.isArray(nextRow)) {
                        for (let k = 0; k < nextRow.length; k++) {
                          const headerValue = String(nextRow[k] || '').toLowerCase();
                          if (headerValue.includes('cantidad de atenciones') || headerValue.includes('cantidad') || 
                              headerValue.includes('atenciones') || headerValue.includes('total') || headerValue.includes('cant')) {
                            columnaCantidad = k;
                            break;
                          }
                        }
                      }
                    }
                    
                    if (columnaCantidad !== -1) {
                      for (let k = i + 2; k < jsonData.length; k++) { // Empezar desde i + 2 (después del header)
                        const dataRow = jsonData[k];
                        if (!dataRow || !Array.isArray(dataRow)) continue;
                        // Detener si es TOTAL o SUMA
                        const primeraColumna = String(dataRow[0] || '').toLowerCase();
                        if (primeraColumna.includes('total') || primeraColumna.includes('suma')) {
                          break;
                        }
                        // Sumar solo si es número válido
                        const val = Number(String(dataRow[columnaCantidad]).replace(/[^\d.-]/g, ''));
                        if (!isNaN(val) && val !== null && val !== undefined && String(dataRow[columnaCantidad]).trim() !== '') {
                          total += val;
                        }
                      }
                    }
                    break; // Solo la primera sección
                  }
                }
                if (encontrado) break;
              }
            }
            
            setTotal(total);
            resolve(total);
          } else if (columnaBuscar.toLowerCase().includes('turnos atendidos')) {
            // Procesamiento específico para "Turnos atendidos"
            let colIdx = -1;
            
            // Buscar en las primeras filas por cualquier columna que contenga "turnos"
            for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
              const row = jsonData[i];
              if (row && Array.isArray(row)) {
                for (let j = 0; j < row.length; j++) {
                  const cellValue = String(row[j] || '').toLowerCase();
                  if (cellValue.includes('turnos') && (cellValue.includes('atendidos') || cellValue.includes('atend'))) {
                    colIdx = j;
                    break;
                  }
                }
                if (colIdx !== -1) break;
              }
            }
            
            if (colIdx !== -1) {
              let total = 0;
              for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row && row[colIdx] !== undefined && row[colIdx] !== null && row[colIdx] !== '') {
                  const val = Number(String(row[colIdx]).replace(/[^\d.-]/g, ''));
                  if (!isNaN(val) && val > 0) {
                    total += val;
                  }
                }
              }
              setTotal(total);
              resolve(total);
            } else {
              setTotal(0);
              resolve(0);
            }
          } else {
            // Procesamiento original para otros tipos de archivos
            let colIdx = -1;
            for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
              const row = jsonData[i];
              if (row && Array.isArray(row)) {
                for (let j = 0; j < row.length; j++) {
                  const cellValue = String(row[j] || '').toLowerCase();
                  if (cellValue.includes(columnaBuscar.toLowerCase())) {
                    colIdx = j;
                    break;
                  }
                }
                if (colIdx !== -1) break;
              }
            }
            if (colIdx !== -1) {
              let total = 0;
              for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row && row[colIdx] !== undefined && row[colIdx] !== null && row[colIdx] !== '') {
                  const val = Number(String(row[colIdx]).replace(/[^\d.-]/g, ''));
                  if (!isNaN(val)) {
                    total += val;
                  }
                }
              }
              setTotal(total);
              resolve(total);
            } else {
              setTotal(0);
              resolve(0);
            }
          }
        } catch (err) {
          console.error('Error al procesar archivo:', err);
          setTotal(0);
          resolve(0);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const procesarArchivoGuardia = (file, setTotal) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          
          // Intentar diferentes opciones de lectura
          let workbook;
          try {
            workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
          } catch (e1) {
            try {
              workbook = XLSX.read(data, { type: 'array', codepage: 1252 });
            } catch (e2) {
              workbook = XLSX.read(data, { type: 'array' });
            }
          }
          
          if (workbook.SheetNames.length === 0) {
            setTotal(0);
            resolve(0);
            return;
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Intentar diferentes métodos de conversión
          let jsonData;
          try {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          } catch (err) {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
          }
          
          // NUEVA LÓGICA SIMPLE: Contar registros con diagnóstico
          let total = 0;
          let columnaDiagnostico = -1;
          
          // Buscar la columna de diagnóstico en las primeras filas
          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && Array.isArray(row)) {
              for (let j = 0; j < row.length; j++) {
                const cellValue = String(row[j] || '').toLowerCase().trim();
                if (cellValue.includes('diagnostico') || cellValue.includes('diagnóstico')) {
                  columnaDiagnostico = j;
                  break;
                }
              }
              if (columnaDiagnostico !== -1) break;
            }
          }
          
          if (columnaDiagnostico === -1) {
            setTotal(0);
            resolve(0);
            return;
          }
          
          // Contar todas las filas que tengan algo escrito en la columna de diagnóstico
          for (let k = 1; k < jsonData.length; k++) { // Empezar desde fila 1 (saltar header)
            const dataRow = jsonData[k];
            if (!dataRow || !Array.isArray(dataRow)) continue;
            
            // Si la fila está completamente vacía, continuar
            if (!dataRow.some(cell => cell && String(cell).trim() !== '')) {
              continue;
            }
            
            // Saltar filas que contengan headers (como "DIAGNOSTICO", "APELLIDO", "NOMBRE", etc.)
            const primeraColumna = String(dataRow[0] || '').toLowerCase().trim();
            if (primeraColumna === 'diagnostico' || primeraColumna === 'diagnóstico' || 
                primeraColumna === 'apellido' || primeraColumna === 'nombre' || 
                primeraColumna === 'dni' || primeraColumna === 'fecha desde' || 
                primeraColumna === 'fecha hasta' || primeraColumna === 'reporte emergencias') {
              continue;
            }
            
            // Verificar si hay diagnóstico en la columna correspondiente
            const diagnostico = String(dataRow[columnaDiagnostico] || '').trim();
            if (diagnostico !== '' && diagnostico !== 'VACÍO' && diagnostico !== 'N/A' && diagnostico !== 'null') {
              total++;
            }
          }
          
          setTotal(total);
          resolve(total);
          
        } catch (err) {
          console.error('Error al procesar archivo de guardia:', err);
          setTotal(0);
          resolve(0);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="tablero-bg">
      <div className="panel" style={{maxWidth:900,margin:'40px auto',marginTop:40}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{color:'#223366',textTransform:'uppercase',fontWeight:'bold',fontSize:'1.3rem',margin:0}}>{nombreEstablecimiento}</h2>
          <button className="analizar-btn" style={{padding:'6px 14px',fontSize:'0.9rem',marginLeft:16}} onClick={()=>navigate('/atencion-medica')}>VOLVER</button>
        </div>
        <div className="form-group" style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
          <label>AÑO</label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="anio-input"
            style={{width:100, fontSize:'1.1rem', padding:'6px', borderRadius:6, border:'1px solid #b0b8d1'}}
          />
        </div>
        <div className="form-group">
          <label>MESES</label>
          <div className="meses-lista">
            <label className="mes-checkbox">
              <input
                type="checkbox"
                checked={todos}
                onChange={()=>handleMesChange('TODOS')}
              />
              TODOS
            </label>
            {MESES.map(mes => (
              <label key={mes} className="mes-checkbox">
                <input
                  type="checkbox"
                  checked={mesesSeleccionados.includes(mes)}
                  onChange={() => handleMesChange(mes)}
                  disabled={todos}
                />
                {mes}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group archivo-group" style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <label style={{fontWeight:'bold',marginRight:8}}>EXAMINAR</label>
          <input type="file" accept=".xlsx,.xls,.xlsm,.xlsb,.xlt,.xltx,.xltm,.ods,.fods,.csv,.txt,.rtf,.html,.htm,.xml,.sylk,.slk,.dif,.prn,.dbf,.wk1,.wk3,.wk4,.123,.wb1,.wb2,.wb3,.qpw,.numbers" onChange={handleArchivo} />
          {archivo && (
            <div style={{marginLeft:8,fontSize:'0.9rem',color:'#666'}}>
              {archivo.name}
            </div>
          )}
          <span style={{fontWeight:'bold',marginLeft:8}}>CONSULTA EXT. MEDICO</span>
        </div>
        <div className="form-group archivo-group" style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <label style={{fontWeight:'bold',marginRight:8}}>EXAMINAR</label>
          <input type="file" accept=".xlsx,.xls,.xlsm,.xlsb,.xlt,.xltx,.xltm,.ods,.fods,.csv,.txt,.rtf,.html,.htm,.xml,.sylk,.slk,.dif,.prn,.dbf,.wk1,.wk3,.wk4,.123,.wb1,.wb2,.wb3,.qpw,.numbers" onChange={handleArchivoGuardia} />
          {archivoGuardia && (
            <div style={{marginLeft:8,fontSize:'0.9rem',color:'#666'}}>
              {archivoGuardia.name}
            </div>
          )}
          <span style={{fontWeight:'bold',marginLeft:8}}>CONSULTA GUARDIA</span>
        </div>

        <div style={{display:'flex',gap:16,marginTop:24,justifyContent:'center'}}>
          <button className="analizar-btn" style={{padding:'6px 20px', fontSize:'0.9rem', minWidth:80}} onClick={handleGuardar} disabled={guardando}>{guardando ? 'PROCESANDO...' : 'GUARDAR'}</button>
          <button className="analizar-btn" style={{padding:'6px 20px', fontSize:'0.9rem', minWidth:80}} onClick={handleAlmacenar} disabled={guardando}>{guardando ? 'PROCESANDO...' : 'ALMACENAR'}</button>
        </div>
        {(totalTurnos !== null || totalGuardia !== null) && (
          <div style={{display:'flex',gap:20,marginTop:24,justifyContent:'center',flexWrap:'wrap'}}>
            {totalTurnos !== null && (
              <div style={{background:'#f8fafd', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'15px 25px', minWidth:280, textAlign:'center', fontWeight:'bold', color:'#223366', fontSize:'1.1rem'}}>
                CONSULTA EXT. MEDICO<br />
                <span style={{fontSize:'1.8rem', color:'#4a90e2'}}>{totalTurnos}</span>
              </div>
            )}
            {totalGuardia !== null && (
              <div style={{background:'#f8fafd', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'15px 25px', minWidth:280, textAlign:'center', fontWeight:'bold', color:'#223366', fontSize:'1.1rem'}}>
                CONSULTA GUARDIA<br />
                <span style={{fontSize:'1.8rem', color:'#4a90e2'}}>{totalGuardia}</span>
              </div>
            )}
            {totalTurnos !== null && totalGuardia !== null && totalGuardia !== 0 && (
              <div style={{background:'#f0f8ff', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'15px 25px', minWidth:280, textAlign:'center', fontWeight:'bold', color:'#223366', fontSize:'1.1rem', border:'2px solid #4a90e2'}}>
                CST.EXT/GUARDIA<br />
                <div className="gauge-indicador">
                  {(() => {
                    const ratio = totalTurnos / totalGuardia;
                    const maxValue = 10;
                    const clampedRatio = Math.min(ratio, maxValue);
                    // Invertir el percent para que 0 esté a la izquierda y 10 a la derecha
                    const percent = 1 - (clampedRatio / maxValue);
                    
                    return (
                      <>
                        <SafeGaugeChart
                          id="gauge-ratio-profesional-guardia"
                          nrOfLevels={100}
                          arcsLength={[0.25, 0.75]}
                          colors={['#ff4136', '#2ecc40']}
                          percent={percent}
                          arcPadding={0.02}
                          textColor="#223366"
                          formatTextValue={value => `${ratio.toFixed(2)}`}
                        />
                        <div className="gauge-label">RATIO PROFESIONAL/GUARDIA</div>
                        <div style={{
                          fontSize:'0.9rem', 
                          fontWeight:'bold', 
                          color: ratio >= 2.5 ? '#2ecc40' : '#ff4136',
                          textTransform: 'uppercase',
                          marginTop: '5px'
                        }}>
                          {ratio >= 2.5 ? '✅ Óptimo' : '⚠️ Bajo'}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
        {mensaje && <div className="success-msg">{mensaje}</div>}
        {error && <div className="error-msg">{error}</div>}

      </div>
    </div>
  );
}

// Pantalla principal de ranking de diagnóstico
function RankingDiagnostico({ user }) {
  const navigate = useNavigate();
  let establecimientosPorZona = [];
  
  if (user && (user.role === 'JEFE_ZONA' || user.role === 'GERENTE')) {
    const asignados = (user.establecimientos || []);
    const asignadosNombres = asignados.map(e =>
      (typeof e === 'string' ? e.toLowerCase().trim() : e.nombre.toLowerCase().trim())
    );
    
    ZONAS.forEach(zona => {
      const ests = zona.establecimientos.filter(est =>
        asignadosNombres.includes(est.toLowerCase().trim())
      );
      if (ests.length > 0) {
        establecimientosPorZona.push({ nombre: zona.nombre, establecimientos: ests });
      }
    });
  } else {
    establecimientosPorZona = ZONAS;
  }
  return (
    <div className="tablero-bg">
      <div style={{textAlign:'center', padding:'30px 0', color:'#fff'}}>
        <h2 style={{fontSize:'2rem', margin:0}}>RANKING DE DIAGNÓSTICO</h2>
        <p>Seleccione un establecimiento para ver los datos o cargue archivos si es la primera vez.</p>
      </div>
      <div className="zonas-grid">
        {establecimientosPorZona && establecimientosPorZona.length > 0 ? (
          establecimientosPorZona.map(zona => (
            <div key={zona.nombre} className="zona-col">
              <div className="zona-titulo">{zona.nombre}</div>
              <div className="zona-establecimientos">
                {zona.establecimientos.map(est => (
                  <button
                    key={est}
                    className="establecimiento-btn"
                    onClick={() => navigate(`/ranking-diagnostico/${encodeURIComponent(est)}`)}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{color:'#fff', textAlign:'center', marginTop:40}}>No hay zonas configuradas.</div>
        )}
      </div>
    </div>
  );
}

// Pantalla específica de establecimiento para ranking de diagnóstico
function RankingDiagnosticoEstablecimiento() {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const nombreEstablecimiento = decodeURIComponent(nombre);

  const CATEGORIAS_RANKING = [
    'Ranking de diagnóstico de emergencia',
    'Ranking de diagnósticos de atención',
    'Ranking de mortalidad',
    'Ranking de motivos de egresos'
  ];

  return (
    <div className="tablero-bg">
      <div className="panel" style={{maxWidth:900,margin:'40px auto',marginTop:40}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{color:'#223366',textTransform:'uppercase',fontWeight:'bold',fontSize:'1.3rem',margin:0}}>{nombreEstablecimiento}</h2>
          <button className="analizar-btn" style={{padding:'8px 18px',fontSize:'1rem',marginLeft:16}} onClick={()=>navigate('/ranking-diagnostico')}>VOLVER</button>
        </div>
        
        <div className="zonas-grid" style={{gap: '20px', marginTop: '20px'}}>
          {CATEGORIAS_RANKING.map(categoria => (
            <div key={categoria} className="zona-col" style={{minWidth: '300px'}}>
              <button
                className="establecimiento-btn"
                style={{width: '100%', padding: '20px', fontSize: '1rem', textAlign: 'center'}}
                onClick={() => navigate(`/ranking-diagnostico/${encodeURIComponent(nombreEstablecimiento)}/${encodeURIComponent(categoria)}`)}
              >
                {categoria}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RankingDiagnosticoCategoria() {
  const { nombre, categoria } = useParams();
  const navigate = useNavigate();
  const [anio, setAnio] = useState(new Date().getFullYear()); // Usar año actual por defecto
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState('');
  const [todos, setTodos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [archivosPorMes, setArchivosPorMes] = useState(null);
  const [resumenAnalisis, setResumenAnalisis] = useState('');

  const nombreEstablecimiento = decodeURIComponent(nombre);
  const categoriaSeleccionada = decodeURIComponent(categoria);

  // Manejar selección de meses con opción TODOS
  const handleMesChange = (mes) => {
    if (mes === 'TODOS') {
      if (todos) {
        setMesesSeleccionados([]);
        setTodos(false);
      } else {
        setMesesSeleccionados([...MESES]);
        setTodos(true);
      }
    } else {
      let nuevos;
      if (mesesSeleccionados.includes(mes)) {
        nuevos = mesesSeleccionados.filter(m => m !== mes);
      } else {
        nuevos = [...mesesSeleccionados, mes];
      }
      setMesesSeleccionados(nuevos);
      setTodos(nuevos.length === MESES.length);
    }
  };

  // Validar formato del archivo Excel
  const validarFormatoArchivo = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Buscar headers requeridos
          let headerRow = null;
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length >= 4) {
              const hasRequiredColumns = 
                (row[0] && String(row[0]).includes('#')) &&
                (row[1] && String(row[1]).toLowerCase().includes('código')) &&
                (row[2] && String(row[2]).toLowerCase().includes('diagnóstico')) &&
                (row[3] && String(row[3]).toLowerCase().includes('cantidad'));
              
              if (hasRequiredColumns) {
                headerRow = i;
                break;
              }
            }
          }
          
          if (headerRow !== null) {
            resolve({ valid: true, message: 'Formato válido' });
          } else {
            resolve({ 
              valid: false, 
              message: `❌ El archivo "${file.name}" no tiene el formato correcto.\nDebe contener columnas: #, Código, Diagnóstico, Cantidad` 
            });
          }
        } catch (error) {
          resolve({ 
            valid: false, 
            message: `❌ Error al leer el archivo "${file.name}": ${error.message}` 
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Leer archivos Excel (múltiples) con validación
  const handleArchivo = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validar extensión
    const archivosValidos = files.every(file => 
      isValidExcelFormat(file.name)
    );
    
    if (files.length === 0) {
      setArchivo(null);
      setError('');
      return;
    }
    
    if (!archivosValidos) {
      setError(`❌ Solo se permiten archivos de Excel. Formatos soportados: ${EXCEL_FORMATS.join(', ')}`);
      setArchivo(null);
      return;
    }
    
    // Validar formato de cada archivo
    setError('🔍 Validando formato de archivos...');
    
    for (const file of files) {
      const validacion = await validarFormatoArchivo(file);
      if (!validacion.valid) {
        setError(validacion.message);
        setArchivo(null);
        return;
      }
    }
    
    // Si llegamos aquí, todos los archivos son válidos
    setArchivo(files);
    setError('✅ Archivos válidos - Formato correcto detectado');
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setError('');
    }, 3000);
  };

  // Procesar datos para extraer los primeros 4 diagnósticos
  const analizar = async () => {
    setError('');
    if (!mesesSeleccionados.length) {
      setResultados(null);
      setError('Debe seleccionar al menos un mes.');
      return;
    }

    if (!anio) {
      setResultados(null);
      setError('Debe establecer un año válido.');
      return;
    }

    try {
      // Llamar al backend para analizar archivos por meses
      const response = await fetchWithAuth(`https://tablero-control-1.onrender.com/ranking/analizar/${encodeURIComponent(nombreEstablecimiento)}/${encodeURIComponent(categoriaSeleccionada)}/${anio}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meses: mesesSeleccionados
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setResultados(result.totalesGenerales);
        setArchivosPorMes(result.archivosEncontradosPorMes);
        setResumenAnalisis(result.resumen || '');
        
        // Mostrar información de archivos analizados por mes
        if (result.archivosEncontradosPorMes) {
          const infoPorMes = Object.entries(result.archivosEncontradosPorMes)
            .map(([mes, archivos]) => `${mes}: ${archivos.join(', ')}`)
            .join('\n');
          console.log('Archivos analizados por mes:', infoPorMes);
        }
        
        setError('');
      } else {
        setResultados(null);
        setArchivosPorMes(null);
        setResumenAnalisis('');
        setError(result.error || 'Error al analizar los archivos');
      }
    } catch (err) {
      console.error('Error al analizar:', err);
      setResultados(null);
      setError('Error de conexión con el servidor');
    }
  };

  // Guardar múltiples archivos en backend
  const handleGuardar = async () => {
    setGuardando(true);
    setGuardado(false);
    setError('');
    
    if (!archivo || archivo.length === 0) {
      setError('Debe seleccionar al menos un archivo.');
      setGuardando(false);
      return;
    }
    
    try {
      let archivosGuardados = 0;
      let errores = [];
      let mesesDetectados = [];
      let añoDetectado = null;
      
      // Guardar cada archivo individualmente y extraer fechas
      for (let i = 0; i < archivo.length; i++) {
        const file = archivo[i];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          // Usar el año detectado si ya tenemos uno, sino usar un año temporal
          const anioAUsar = añoDetectado || anio || new Date().getFullYear();
          const url = `https://tablero-control-1.onrender.com/ranking/guardar/${encodeURIComponent(nombreEstablecimiento)}/${encodeURIComponent(categoriaSeleccionada)}/${anioAUsar}`;
          console.log('URL de guardado:', url);
          
          const response = await fetchWithAuth(url, {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json();
          
          if (result.success) {
            archivosGuardados++;
            
            // ✅ MANEJAR CAMBIO AUTOMÁTICO DE AÑO
            if (result.cambioAutomatico) {
              console.log(`🔄 Cambio automático de año: ${result.anioOriginal} → ${result.anioUsado}`);
            }
            
            // Procesar información de fecha si está disponible
            if (result.fechaInfo) {
              console.log('Fecha detectada:', result.fechaInfo);
              
              // Si es todo el año, marcar todos los meses
              if (result.fechaInfo.mes === 'TODOS' || result.fechaInfo.esTodoElAño) {
                mesesDetectados = [...MESES]; // Marcar todos los meses
                console.log('Detectado: TODO EL AÑO - marcando todos los meses');
              } else if (result.fechaInfo.mes && result.fechaInfo.mes !== 'DESCONOCIDO' && result.fechaInfo.mes !== 'ERROR') {
                // Agregar mes específico detectado si no está ya en la lista
                if (!mesesDetectados.includes(result.fechaInfo.mes)) {
                  mesesDetectados.push(result.fechaInfo.mes);
                  console.log('Mes detectado agregado:', result.fechaInfo.mes);
                }
              }
            }
            
            // ✅ USAR EL AÑO USADO POR EL BACKEND (puede ser diferente al detectado)
            if (result.anioUsado) {
              añoDetectado = parseInt(result.anioUsado);
              console.log('Año usado por el backend:', result.anioUsado);
            }
          } else {
            // 🔍 MENSAJES DE ERROR ESPECÍFICOS
            let errorMsg = result.error || 'Error desconocido';
            
            if (response.status === 400) {
              // Error de validación de contenido
              if (result.error && result.error.includes('no corresponde a la categoría')) {
                errorMsg = `❌ ARCHIVO INCORRECTO: ${result.error}`;
              } else if (result.error && result.error.includes('formato correcto')) {
                errorMsg = `❌ FORMATO INCORRECTO: ${result.error}`;
              } else {
                errorMsg = `❌ ARCHIVO NO VÁLIDO: ${result.error}`;
              }
            } else if (response.status === 423) {
              errorMsg = '🔒 Archivo bloqueado - Cierra Excel';
            } else if (response.status === 409) {
              errorMsg = '⚠️ Subida duplicada - Espera un momento';
            } else if (response.status === 429) {
              errorMsg = '⏳ Demasiadas operaciones - Espera';
            } else if (response.status === 500) {
              errorMsg = '❌ Error del servidor - Verifica Excel';
            }
            
            errores.push(`${file.name}: ${errorMsg}`);
            
            // Si es error específico, mostrar solución
            if (result.solucion) {
              console.log(`💡 Solución para ${file.name}:`, result.solucion);
            }
          }
        } catch (fileErr) {
          console.error('Error de conexión:', fileErr);
          errores.push(`${file.name}: 🌐 Error de conexión`);
        }
      }
      
      // Mostrar resultados
      if (archivosGuardados > 0) {
        setGuardado(true);
        
        // Automáticamente marcar los meses detectados
        if (mesesDetectados.length > 0) {
          setMesesSeleccionados(mesesDetectados);
          // Si son todos los meses, marcar también el checkbox "TODOS"
          if (mesesDetectados.length === MESES.length) {
            setTodos(true);
            console.log('Meses automáticamente seleccionados: TODOS');
          } else {
            setTodos(false);
            console.log('Meses automáticamente seleccionados:', mesesDetectados);
          }
        }
        
        // Automáticamente establecer el año detectado
        if (añoDetectado) {
          setAnio(añoDetectado);
          console.log('Año automáticamente establecido:', añoDetectado);
        }
        
        if (errores.length > 0) {
          setError(`${archivosGuardados} archivos guardados correctamente. Errores: ${errores.join(', ')}`);
        } else {
          setError('');
        }
        
        // Mensaje de éxito con información automática
        setTimeout(() => {
          setGuardado(false);
          if (mesesDetectados.length > 0 || añoDetectado) {
            let mensaje = `✅ ${archivosGuardados} archivos procesados.`;
            if (mesesDetectados.length > 0) {
              mensaje += ` Meses: ${mesesDetectados.join(', ')}.`;
            }
            if (añoDetectado && añoDetectado.toString() !== anio.toString()) {
              mensaje += ` 🎯 AÑO AUTO-DETECTADO: ${añoDetectado} (configurado: ${anio})`;
            } else if (añoDetectado && añoDetectado.toString() === anio.toString()) {
              mensaje += ` ✅ Año confirmado: ${añoDetectado}`;
            } else if (añoDetectado) {
              mensaje += ` Año: ${añoDetectado}`;
            }
            setError(mensaje);
            setTimeout(() => setError(''), 6000);
          }
        }, 2000);
      } else {
        setError(`No se pudo guardar ningún archivo. Errores: ${errores.join(', ')}`);
      }
      
    } catch (err) {
      console.error('Error durante el guardado:', err);
      setError('Error general: ' + err.message);
    }
    setGuardando(false);
  };

  return (
    <div className="tablero-bg">
      <div className="panel" style={{maxWidth:900,margin:'40px auto',marginTop:40}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{color:'#223366',textTransform:'uppercase',fontWeight:'bold',fontSize:'1.3rem',margin:0}}>
            {nombreEstablecimiento} - {categoriaSeleccionada}
          </h2>
          <button className="analizar-btn" style={{padding:'8px 18px',fontSize:'1rem',marginLeft:16}} 
                  onClick={()=>navigate(`/ranking-diagnostico/${encodeURIComponent(nombreEstablecimiento)}`)}>
            VOLVER
          </button>
        </div>

        <div className="form-group" style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
          <label>AÑO</label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="anio-input"
            style={{width:100, fontSize:'1.1rem', padding:'6px', borderRadius:6, border:'1px solid #b0b8d1'}}
          />
          <span style={{fontSize:'0.9rem', color:'#666'}}>
            El año y los meses se detectan automáticamente de los archivos Excel. Si no se detecta, se usa {anio}.
          </span>
        </div>

        <div className="form-group">
          <label>MESES</label>
          <div className="meses-lista">
            <label className="mes-checkbox">
              <input
                type="checkbox"
                checked={todos}
                onChange={()=>handleMesChange('TODOS')}
              />
              TODOS
            </label>
            {MESES.map(mes => (
              <label key={mes} className="mes-checkbox">
                <input
                  type="checkbox"
                  checked={mesesSeleccionados.includes(mes)}
                  onChange={() => handleMesChange(mes)}
                />
                {mes}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group archivo-group" style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <label style={{fontWeight:'bold',marginRight:8}}>EXAMINAR</label>
          <input type="file" accept={getExcelAcceptAttribute()} multiple onChange={handleArchivo} />
          {archivo && archivo.length > 0 && (
            <div style={{marginLeft:8,fontSize:'0.9rem',color:'#666'}}>
              {archivo.length === 1 ? 
                archivo[0].name : 
                `${archivo.length} archivos seleccionados: ${archivo.map(f => f.name).join(', ')}`
              }
            </div>
          )}
          
          <button
            className="analizar-btn"
            onClick={analizar}
            disabled={mesesSeleccionados.length === 0}
          >
            ANALIZAR
          </button>
          
          <button className="analizar-btn" onClick={handleGuardar} disabled={!archivo || archivo.length === 0 || guardando}>
            {guardando ? 'PROCESANDO...' : 'PROCESAR ARCHIVOS'}
          </button>
        </div>

        {guardado && <div className="success-msg">Archivos procesados correctamente.</div>}
      </div>

      {/* Mostrar información de archivos analizados por mes */}
      {archivosPorMes && Object.keys(archivosPorMes).length > 0 && (
        <div className="panel" style={{maxWidth:900,margin:'20px auto'}}>
          <h3 style={{color:'#223366',textAlign:'center',marginBottom:15}}>ARCHIVOS ANALIZADOS POR MES</h3>
          {resumenAnalisis && (
            <p style={{textAlign:'center',color:'#666',marginBottom:15,fontSize:'0.9rem'}}>
              {resumenAnalisis}
            </p>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:10,marginBottom:20}}>
            {Object.entries(archivosPorMes).map(([mes, archivos]) => (
              <div key={mes} style={{
                background:'#f8f9fa',
                border:'1px solid #e9ecef',
                borderRadius:6,
                padding:12
              }}>
                <div style={{fontWeight:'bold',color:'#4a90e2',marginBottom:5}}>{mes}</div>
                <div style={{fontSize:'0.85rem',color:'#666'}}>
                  {archivos.map((archivo, idx) => (
                    <div key={idx} style={{marginBottom:2}}>
                      📄 {archivo}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mostrar resultados de top 4 diagnósticos */}
      {resultados && (
        <div className="panel" style={{maxWidth:900,margin:'20px auto'}}>
          <h3 style={{color:'#223366',textAlign:'center',marginBottom:20}}>TOP 4 DIAGNÓSTICOS</h3>
          <table style={{width:'100%', borderCollapse:'collapse', background:'white'}}>
            <thead>
              <tr style={{background:'#4a90e2', color:'white'}}>
                <th style={{padding:'12px', border:'1px solid #ddd', textAlign:'center'}}>#</th>
                <th style={{padding:'12px', border:'1px solid #ddd', textAlign:'left'}}>CÓDIGO</th>
                <th style={{padding:'12px', border:'1px solid #ddd', textAlign:'left'}}>DIAGNÓSTICO</th>
                <th style={{padding:'12px', border:'1px solid #ddd', textAlign:'center'}}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((resultado, index) => (
                <tr key={index} style={{borderBottom:'1px solid #ddd'}}>
                  <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center', fontWeight:'bold'}}>
                    {index + 1}
                  </td>
                  <td style={{padding:'10px', border:'1px solid #ddd', fontWeight:'bold', color:'#223366'}}>
                    {resultado.codigo}
                  </td>
                  <td style={{padding:'10px', border:'1px solid #ddd'}}>
                    {resultado.diagnostico}
                  </td>
                  <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center', fontWeight:'bold', color:'#4a90e2'}}>
                    {resultado.cantidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="error-msg">{error}</div>
      )}
    </div>
  );
}

// Definir UsuariosLista antes de App
function UsuariosLista({ user, token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://tablero-control-1.onrender.com/api/auth/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsuarios(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSaveRole = (newRole, establecimientos) => {
    fetch(`https://tablero-control-1.onrender.com/api/auth/users/${editUser.id}/update-role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role: newRole, establecimientos })
    })
      .then(res => res.json())
      .then(() => {
        setEditUser(null);
        // Refrescar lista
        setLoading(true);
        fetch('https://tablero-control-1.onrender.com/api/auth/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            setUsuarios(data.users || []);
            setLoading(false);
          });
      });
  };

  if (loading) return <div style={{color:'#fff',padding:40}}>Cargando usuarios...</div>;

  return (
    <div className="usuarios-lista" style={{padding:40}}>
      <h2>Usuarios</h2>
      <table style={{width:'100%',background:'#fff',borderRadius:8}}>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.nombre} {u.apellido}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => setEditUser(u)} title="Editar rol" style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editUser && <EditarRolModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveRole} />}
    </div>
  );
}

// Definir Perfil antes de App
function Perfil({ user, token }) {
  return (
    <div className="perfil-container" style={{padding: 40, color: '#333'}}>
      <h2>Mi Perfil</h2>
      <p><strong>Usuario:</strong> {user.username}</p>
      <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
      <p><strong>Rol:</strong> {user.role}</p>
      {/* Si es ADMIN, mostrar la tabla de usuarios debajo */}
      {user.role === 'ADMIN' && (
        <div style={{marginTop: 40}}>
          <UsuariosLista user={user} token={token} />
        </div>
      )}
    </div>
  );
}

// Definir EditarRolModal antes de UsuariosLista y Perfil
function EditarRolModal({ user, onClose, onSave }) {
  const [rol, setRol] = useState(user.role);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [selectedEst, setSelectedEst] = useState(user.establecimientos || []);
  const [loadingEst, setLoadingEst] = useState(false);

  useEffect(() => {
    if (rol === 'JEFE_ZONA' || rol === 'GERENTE') {
      setLoadingEst(true);
      fetch('https://tablero-control-1.onrender.com/api/auth/establecimientos')
        .then(res => res.json())
        .then(data => {
          setEstablecimientos(data.establecimientos || []);
          setLoadingEst(false);
        });
    }
  }, [rol]);

  const handleCheck = (id) => {
    if (rol === 'JEFE_ZONA') {
      setSelectedEst(selectedEst.includes(id) ? selectedEst.filter(e => e !== id) : [...selectedEst, id]);
    } else if (rol === 'GERENTE') {
      setSelectedEst([id]);
    }
  };

  const handleSave = () => {
    if ((rol === 'JEFE_ZONA' && selectedEst.length === 0) || (rol === 'GERENTE' && selectedEst.length !== 1)) {
      alert('Selecciona los establecimientos correspondientes.');
      return;
    }
    onSave(rol, selectedEst);
  };

  return (
    <div className="modal-bg" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div className="modal-content" style={{background:'#fff',padding:30,borderRadius:8,minWidth:300}}>
        <h3>Editar Rol de {user.username}</h3>
        <select value={rol} onChange={e => { setRol(e.target.value); setSelectedEst([]); }} style={{width:'100%',padding:8,margin:'16px 0'}}>
          <option value="ADMIN">ADMIN</option>
          <option value="DIRECTOR">DIRECTOR</option>
          <option value="JEFE_ZONA">JEFE_ZONA</option>
          <option value="GERENTE">GERENTE</option>
          <option value="ESTABLECIMIENTO">ESTABLECIMIENTO</option>
        </select>
        {(rol === 'JEFE_ZONA' || rol === 'GERENTE') && (
          <div style={{margin:'16px 0'}}>
            <label><strong>Establecimientos:</strong></label>
            {loadingEst ? <div>Cargando establecimientos...</div> : (
              <div style={{maxHeight:200,overflowY:'auto',border:'1px solid #eee',padding:8,borderRadius:4}}>
                {establecimientos.map(est => (
                  <div key={est.id}>
                    <label>
                      <input
                        type={rol === 'JEFE_ZONA' ? 'checkbox' : 'radio'}
                        checked={selectedEst.includes(est.id)}
                        onChange={() => handleCheck(est.id)}
                      /> {est.nombre}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// Componente principal de la aplicación
function App() {
  console.log('🚀 APP.JS EJECUTÁNDOSE - VERSIÓN ACTUALIZADA');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate(); // <--- AGREGADO
  
  // Debug: verificar que App se está cargando
  console.log('Componente App cargándose');

  // Verificar token al cargar la aplicación (solo una vez)
  useEffect(() => {
    console.log('useEffect ejecutándose - verificando token');
    const token = localStorage.getItem('token');
    console.log('Token encontrado:', token ? 'SÍ' : 'NO');
    if (token) {
      // Verificar si el token es válido
      fetch('https://tablero-control-1.onrender.com/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log('Respuesta del servidor:', data);
        if (data.success) {
          console.log('Usuario autenticado:', data.user);
          setUser(data.user);
          if (data.user.first_login) {
            setShowChangePassword(true);
          }
          // Redirección automática tras login exitoso
          navigate('/sistema-tablero');
        } else {
          console.log('Token inválido, removiendo del localStorage');
          localStorage.removeItem('token');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error al verificar token:', error);
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      console.log('No hay token, mostrando login');
      setLoading(false);
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  // Botón de logout arriba a la derecha
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Mostrar loading solo al inicio de la aplicación
  if (loading) {
    return (
      <div className="App">
        <div className="tablero-bg">
          <div style={{textAlign: 'center', padding: '100px 20px', color: '#fff'}}>
            <h2>Cargando...</h2>
            <p>Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrarse" element={<Register />} />
        <Route path="/confirmar/:token" element={<ConfirmEmail />} />
        
        {/* Rutas directas para las secciones principales */}
        <Route path="/indicadores-camas" element={<Navigate to="/sistema-tablero/indicadores-camas" replace />} />
        
        <Route path="/atencion-medica" element={<Navigate to="/sistema-tablero/atencion-medica" replace />} />
        
        <Route path="/ranking-diagnostico" element={<Navigate to="/sistema-tablero/ranking-diagnostico" replace />} />
        
        {/* Rutas protegidas */}
        <Route path="/sistema-tablero" element={
          user ? (
            <div>
              <div className="logout-bar">
                <span className="user-name">{user?.nombre} {user?.apellido}</span>
                {user?.role === 'ADMIN' && (
                  <button className="config-btn" onClick={() => window.location.href = '/configuracion'}>
                    Configuración
                  </button>
                )}
                <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
              </div>
              <div className="tablero-bg">
                <div className="logo-sdo-banner">
                  <img src="/static/media/logoo.c9263002735465189850.png" alt="Logo SDO" />
                  <h1 className="banner-title">SISTEMA DE TABLEROS DE CONTROL</h1>
                </div>
                <div className="container">
                  <Home user={user} />
                </div>
              </div>
            </div>
          ) : (
            <Login />
          )
        } />
        
        <Route path="/configuracion" element={
          user && user.role === 'ADMIN' ? (
            <div className="tablero-bg">
              <div className="logo-sdo-banner">
                <img src="/static/media/logoo.c9263002735465189850.png" alt="Logo SDO" />
                <h1 className="banner-title">SISTEMA DE TABLEROS DE CONTROL</h1>
              </div>
              <div className="logout-bar">
                <span className="user-name">{user?.nombre} {user?.apellido}</span>
                <button className="config-btn" onClick={() => window.location.href = '/sistema-tablero'}>
                  Sistema de Tablero
                </button>
                <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
              </div>
              <div className="container">
                <Configuracion onClose={() => window.location.href = '/sistema-tablero'} />
              </div>
            </div>
          ) : (
            <Login />
          )
        } />
        
        <Route path="/perfil" element={user ? <Perfil user={user} token={localStorage.getItem('token')} /> : <Login />} />
        <Route path="/perfiles" element={user ? <Perfil user={user} token={localStorage.getItem('token')} /> : <Login />} />
        
        <Route path="/change-password" element={<ChangePassword />} />
        {/* Rutas directas para los detalles de cada sección */}
                  <Route path="/indicadores-camas/:nombre" element={
            user ? (
              <IndicadoresCamasEstablecimiento user={user} />
            ) : (
              <Login />
            )
          } />
        <Route path="/atencion-medica/:nombre" element={
          user ? (
            <AtencionMedicaEstablecimiento user={user} />
          ) : (
            <Login />
          )
        } />
        <Route path="/ranking-diagnostico/:nombre" element={
          user ? (
            <RankingDiagnosticoEstablecimiento />
          ) : (
            <Login />
          )
        } />
        <Route path="/ranking-diagnostico/:nombre/:categoria" element={
          user ? (
            <RankingDiagnosticoCategoria />
          ) : (
            <Login />
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
