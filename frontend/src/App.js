import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Outlet, Navigate } from 'react-router-dom';
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
    <div className="box" style={{cursor:'pointer', minWidth: 320}} onClick={() => navigate(`/sistema-tablero/${rutaBase}`)}>
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
                  onClick={(e) => { e.stopPropagation(); navigate(`/sistema-tablero/${rutaBase}/${encodeURIComponent(est)}`); }}
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
                    onClick={() => navigate(`/sistema-tablero/indicadores-camas/${encodeURIComponent(est)}`)}
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

function RankingDiagnostico({ user }) {
  const navigate = useNavigate();

  const getEstablecimientosPorZona = () => {
    if (!user || user.role === 'ADMIN' || user.role === 'DIRECTOR') {
      return ZONAS;
    }
    if (user.role === 'JEFE_ZONA' || user.role === 'GERENTE') {
      const asignados = (user.establecimientos || []).map(e => (typeof e === 'string' ? e.toLowerCase().trim() : e.nombre.toLowerCase().trim()));
      return ZONAS.map(zona => ({
        nombre: zona.nombre,
        establecimientos: zona.establecimientos.filter(est => asignados.includes(est.toLowerCase().trim()))
      })).filter(zona => zona.establecimientos.length > 0);
    }
    return [];
  };

  const zonasFiltradas = getEstablecimientosPorZona();

  return (
    <div className="tablero-bg">
      <div style={{textAlign:'center', padding:'30px 0', color:'#fff'}}>
        <h2 style={{fontSize:'2rem', margin:0}}>RANKING DE DIAGNÓSTICO</h2>
      </div>
      <div className="zonas-grid">
        {zonasFiltradas.map(zona => (
          <div key={zona.nombre} className="zona-col">
            <div className="zona-titulo">{zona.nombre}</div>
            <div className="zona-establecimientos">
              {zona.establecimientos.map(est => (
                <button
                  key={est}
                  className="establecimiento-btn"
                  onClick={() => navigate(`/sistema-tablero/ranking-diagnostico/${encodeURIComponent(est)}`)}
                >
                  {est}
                </button>
              ))}
            </div>
{{ ... }}
            <div className="zona-establecimientos">
              {zona.establecimientos.map(est => (
                <button
                  key={est}
                  className="establecimiento-btn"
                  onClick={() => navigate(`/sistema-tablero/atencion-medica/${encodeURIComponent(est)}`)}
                >
                  {est}
                </button>
              ))}
            </div>
{{ ... }}
  return (
    <div className="tablero-bg">
      <div className="panel" style={{maxWidth:900,margin:'40px auto',marginTop:40}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{color:'#223366',textTransform:'uppercase',fontWeight:'bold',fontSize:'1.3rem',margin:0}}>{nombreEstablecimiento}</h2>
          <button className="analizar-btn" style={{padding:'8px 18px',fontSize:'1rem',marginLeft:16}} onClick={()=>navigate('/sistema-tablero/ranking-diagnostico')}>VOLVER</button>
        </div>
        
        <div className="zonas-grid" style={{gap: '20px', marginTop: '20px'}}>
          {CATEGORIAS_RANKING.map(categoria => (
            <div key={categoria} className="zona-col" style={{minWidth: '300px'}}>
              <button
                className="establecimiento-btn"
                style={{width: '100%', padding: '20px', fontSize: '1rem', textAlign: 'center'}}
                onClick={() => navigate(`/sistema-tablero/ranking-diagnostico/${encodeURIComponent(nombreEstablecimiento)}/${encodeURIComponent(categoria)}`)}
              >
                {categoria}
              </button>
            </div>
          ))}
{{ ... }}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{color:'#223366',textTransform:'uppercase',fontWeight:'bold',fontSize:'1.3rem',margin:0}}>
            {nombreEstablecimiento} - {categoriaSeleccionada}
          </h2>
          <button className="analizar-btn" style={{padding:'8px 18px',fontSize:'1rem',marginLeft:16}} 
                  onClick={()=>navigate(`/sistema-tablero/ranking-diagnostico/${encodeURIComponent(nombreEstablecimiento)}`)}>
            VOLVER
          </button>
        </div>

        <div className="form-group" style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
{{ ... }}
        <Route path="/sistema-tablero/indicadores-camas/:nombre" element={user ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><IndicadoresCamasEstablecimiento user={user} /></div> : <Navigate to="/login" />} />
        
        <Route path="/sistema-tablero/atencion-medica" element={user ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><AtencionMedica user={user} /></div> : <Navigate to="/login" />} />
        <Route path="/sistema-tablero/atencion-medica/:nombre" element={user ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><AtencionMedicaEstablecimiento user={user} /></div> : <Navigate to="/login" />} />
        
        <Route path="/sistema-tablero/ranking-diagnostico" element={user ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><RankingDiagnostico user={user} /></div> : <Navigate to="/login" />} />
        <Route path="/sistema-tablero/ranking-diagnostico/:nombre" element={user ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><RankingDiagnosticoEstablecimiento user={user} /></div> : <Navigate to="/login" />} />
        <Route path="/sistema-tablero/ranking-diagnostico/:nombre/:categoria" element={user ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><RankingDiagnosticoCategoria user={user} /></div> : <Navigate to="/login" />} />

        <Route path="/configuracion" element={user && user.role === 'ADMIN' ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><div className="container"><Configuracion /></div></div> : <Navigate to="/login" />} />
        <Route path="/perfil" element={user ? <div className="tablero-bg"><BannerUsuario user={user} handleLogout={handleLogout} /><div className="container"><Perfil user={user} token={localStorage.getItem('token')} /></div></div> : <Navigate to="/login" />} />

        {/* Redirecciones */}
        <Route path="/indicadores-camas" element={<Navigate to="/sistema-tablero/indicadores-camas" replace />} />
        <Route path="/atencion-medica" element={<Navigate to="/sistema-tablero/atencion-medica" replace />} />
        <Route path="/ranking-diagnostico" element={<Navigate to="/sistema-tablero/ranking-diagnostico" replace />} />

      </Routes>
    </div>
  );
}
{{ ... }}
export default App;
