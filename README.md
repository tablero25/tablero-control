# 🏥 Tablero de Control - Sistema de Gestión Hospitalaria

## 📋 Descripción

Sistema completo de gestión y control de datos hospitalarios que permite la carga, procesamiento y análisis de archivos Excel con información médica de diferentes establecimientos de salud.

## 🌐 URL de Producción

**https://tablero-control-1.onrender.com**

## 🚀 Características Principales

### ✅ **Funcionalidades Implementadas:**
- 🔐 **Sistema de Autenticación Completo**
  - Login/Logout seguro
  - Registro de usuarios con confirmación por email
  - Cambio de contraseñas
  - Gestión de roles (Admin, Usuario)
  - Verificación de tokens JWT

- 📊 **Gestión de Archivos Excel**
  - Carga de archivos por establecimiento y año
  - Validación automática de formatos
  - Procesamiento de datos médicos
  - Descarga de archivos procesados

- 🏥 **Módulos Especializados:**
  - **Ranking de Diagnósticos** - Análisis de diagnósticos más frecuentes
  - **Atención Profesional** - Gestión por consultorio
  - **Guardia** - Reportes de emergencias
  - **Ranking de Mortalidad** - Estadísticas de mortalidad
  - **Ranking de Motivos de Egresos** - Análisis de egresos

- 👥 **Gestión de Usuarios**
  - Panel de administración
  - Activación/desactivación de usuarios
  - Reset de contraseñas
  - Confirmación de usuarios pendientes

## 🛠️ Tecnologías Utilizadas

### **Frontend:**
- **React.js** - Framework principal
- **CSS3** - Estilos y diseño responsivo
- **JavaScript ES6+** - Lógica de aplicación

### **Backend:**
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación y autorización
- **Multer** - Manejo de archivos
- **Nodemailer** - Envío de emails
- **xlsx** - Procesamiento de archivos Excel

### **Infraestructura:**
- **Render.com** - Hosting y despliegue
- **GitHub** - Control de versiones
- **PostgreSQL (Render)** - Base de datos en la nube

## 📁 Estructura del Proyecto

```
Tablero 1/
├── backend/                 # Servidor Node.js
│   ├── index.js            # Servidor principal
│   ├── auth.js             # Configuración de autenticación
│   ├── db.js               # Configuración de base de datos
│   ├── emailConfig.js      # Configuración de email
│   └── data/               # Datos de establecimientos
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── App.js          # Componente principal
│   │   ├── Login.js        # Página de login
│   │   ├── Register.js     # Página de registro
│   │   ├── Configuracion.js # Panel de administración
│   │   └── ...
│   └── public/
└── BACKUP_FINAL_COMPLETO/  # Backup completo del sistema
```

## 🔧 Instalación y Configuración

### **Requisitos Previos:**
- Node.js (v14 o superior)
- PostgreSQL
- Git

### **Pasos de Instalación:**

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tablero25/tablero-control.git
cd tablero-control
```

2. **Instalar dependencias del backend:**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend:**
```bash
cd ../frontend
npm install
```

4. **Configurar variables de entorno:**
```bash
# En backend/
cp emailConfig.example.js emailConfig.js
# Editar emailConfig.js con tus credenciales
```

5. **Configurar base de datos:**
```bash
# Ejecutar scripts de configuración
node setup_production_db.js
```

## 🔐 Configuración de Variables de Entorno

### **Backend (.env):**
```env
DATABASE_URL=postgresql://usuario:password@host:puerto/database
JWT_SECRET=tu_jwt_secret_super_seguro
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
PORT=5001
```

### **Frontend:**
Las URLs ya están configuradas para producción en:
- `https://tablero-control-1.onrender.com`

## 🚀 Despliegue

### **Render.com (Recomendado):**

1. **Conectar repositorio de GitHub**
2. **Configurar variables de entorno:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `PORT`

3. **Comando de build:**
```bash
npm install && npm run build
```

4. **Comando de start:**
```bash
node index.js
```

## 📊 Estructura de Base de Datos

### **Tablas Principales:**
- `users` - Usuarios del sistema
- `establecimientos` - Establecimientos de salud
- `archivos` - Metadatos de archivos cargados
- `ranking_diagnosticos` - Datos de diagnósticos
- `atencion_profesional` - Datos de atención por consultorio
- `guardia` - Datos de emergencias

## 🔑 Credenciales de Acceso

### **Usuario Administrador:**
- **Email:** admin@tablero.com
- **Contraseña:** admin123
- **Rol:** Admin

### **Funciones de Administrador:**
- Gestión completa de usuarios
- Configuración del sistema
- Acceso a todos los módulos
- Estadísticas del sistema

## 📱 Uso del Sistema

### **1. Acceso:**
- Ir a: https://tablero-control-1.onrender.com
- Iniciar sesión con credenciales

### **2. Carga de Archivos:**
- Seleccionar establecimiento
- Elegir año
- Cargar archivo Excel
- Validar formato
- Procesar datos

### **3. Análisis de Datos:**
- Ver rankings de diagnósticos
- Analizar atención profesional
- Revisar reportes de guardia
- Exportar resultados

## 🛡️ Seguridad

### **Medidas Implementadas:**
- ✅ Autenticación JWT
- ✅ Hashing de contraseñas (bcrypt)
- ✅ Validación de tokens
- ✅ Control de acceso por roles
- ✅ Sanitización de datos
- ✅ Validación de archivos
- ✅ HTTPS en producción

## 📈 Funcionalidades Avanzadas

### **Procesamiento de Excel:**
- Validación automática de formatos
- Extracción de datos médicos
- Generación de rankings
- Exportación de resultados

### **Sistema de Emails:**
- Confirmación de registro
- Reset de contraseñas
- Notificaciones del sistema
- Alertas de seguridad

### **Panel de Administración:**
- Gestión de usuarios
- Estadísticas del sistema
- Configuración general
- Logs de actividad

## 🔄 Mantenimiento

### **Backup Automático:**
- Base de datos respaldada en Render
- Código versionado en GitHub
- Backup local disponible

### **Monitoreo:**
- Logs de aplicación
- Estadísticas de uso
- Alertas de errores
- Métricas de rendimiento

## 📞 Soporte

### **Contacto:**
- **Desarrollador:** LuxioT
- **Email:** [Tu email]
- **GitHub:** https://github.com/tablero25

### **Documentación Adicional:**
- `GUIA_VALIDACION.md` - Guía de validación de archivos
- Comentarios en el código
- Logs del sistema

## 🎯 Roadmap

### **Próximas Funcionalidades:**
- [ ] Dashboard con gráficos interactivos
- [ ] API REST completa
- [ ] Aplicación móvil
- [ ] Integración con sistemas hospitalarios
- [ ] Reportes automáticos
- [ ] Machine Learning para análisis predictivo

## 📄 Licencia

Este proyecto es propiedad del sistema de salud y está destinado para uso interno.

---

## ✅ Estado Actual

**🟢 SISTEMA COMPLETAMENTE OPERATIVO**

- ✅ **Desplegado en producción**
- ✅ **Base de datos configurada**
- ✅ **Autenticación funcionando**
- ✅ **Todas las funcionalidades activas**
- ✅ **URLs actualizadas a producción**
- ✅ **Backup completo realizado**

**🌐 Acceso:** https://tablero-control-1.onrender.com
