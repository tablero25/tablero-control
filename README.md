# 🏥 Sistema de Tableros de Control

Sistema completo de gestión y análisis de datos hospitalarios con interfaz web moderna y APIs robustas.

## 🚀 Características

- **📊 Análisis de Excel**: Procesamiento avanzado de archivos Excel (.xlsx, .xls)
- **🏥 Gestión de Establecimientos**: Soporte para múltiples hospitales y zonas
- **📈 Indicadores en Tiempo Real**: Métricas de producción, camas, consultas
- **🔐 Autenticación Segura**: Sistema de usuarios con roles y permisos
- **📧 Notificaciones**: Envío de emails automáticos
- **🌐 Interfaz Web Moderna**: React con diseño responsive
- **⚡ APIs RESTful**: Backend Node.js con Express
- **🗄️ Base de Datos PostgreSQL**: Almacenamiento robusto y escalable

## 🏗️ Arquitectura

```
Sistema de Tableros de Control/
├── frontend/          # React App (Interfaz de Usuario)
├── backend/           # Node.js + Express (APIs)
├── data/             # Archivos Excel de datos
├── build.sh          # Script de build para producción
└── render.yaml       # Configuración de despliegue
```

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **React Router** - Navegación entre páginas
- **React Gauge Chart** - Gráficos de indicadores
- **XLSX** - Procesamiento de archivos Excel

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Multer** - Manejo de archivos
- **JWT** - Autenticación
- **Nodemailer** - Envío de emails
- **bcrypt** - Encriptación de contraseñas

## 🚀 Despliegue

### Local Development

```bash
# Instalar todas las dependencias
npm run install:all

# Ejecutar en modo desarrollo
npm run dev
```

### Producción (Render.com)

El sistema está configurado para despliegue automático en Render.com:

1. **Build Command**: `chmod +x build.sh && ./build.sh`
2. **Start Command**: `cd backend && npm start`
3. **Health Check**: `/health`

## 📊 Funcionalidades

### 1. Producción de Internación
- Análisis de ocupación de camas
- Indicadores de días de estancia
- Métricas por establecimiento y zona

### 2. Producción de Consulta Ambulatoria
- Atención profesional por consultorio
- Datos de guardia
- Análisis de consultas por especialidad

### 3. Ranking de Diagnósticos
- Top diagnósticos por categoría
- Análisis temporal (mensual/anual)
- Comparativas entre establecimientos

## 🔧 Configuración

### Variables de Entorno

```env
# Base de Datos
DATABASE_URL=postgresql://user:password@host:port/database

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password

# JWT
JWT_SECRET=tu-secret-key

# Frontend URL (para CORS)
FRONTEND_URL=https://tu-dominio.com
```

## 📁 Estructura de Datos

```
data/
├── [Establecimiento]/
│   ├── [Año]/
│   │   ├── [Mes]/
│   │   │   ├── archivo.xlsx
│   │   │   └── archivo.xls
│   │   └── archivo_anual.xlsx
│   └── Ranking de diagnósticos/
│       └── [Año]/
│           └── [Mes]/
│               └── archivo.xls
```

## 🔐 Autenticación

- **Registro**: Creación de usuarios con validación de email
- **Login**: Autenticación con JWT
- **Roles**: Admin, Establecimiento, Usuario
- **Permisos**: Acceso granular por establecimiento

## 📈 APIs Disponibles

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/change-password` - Cambio de contraseña

### Datos
- `GET /establecimientos` - Lista de establecimientos
- `POST /guardar/:establecimiento/:anio` - Subir archivos
- `GET /analizar/:establecimiento/:anio` - Analizar datos

### Health Check
- `GET /health` - Estado del sistema

## 🎯 Uso

1. **Acceder al sistema**: https://tablero-control-1.onrender.com
2. **Registrarse** o **iniciar sesión**
3. **Seleccionar establecimiento** y **categoría**
4. **Subir archivos Excel** con datos
5. **Analizar** y **visualizar** indicadores

## 🔄 Actualizaciones

El sistema se actualiza automáticamente en Render.com cuando se hace push a la rama `main`.

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: [tu-email@dominio.com]
- **Documentación**: [URL de documentación]

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**Desarrollado con ❤️ para el Sistema de Salud Pública** 