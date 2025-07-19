# Tableros de Control - Indicadores de Gestión

Sistema web para gestión y visualización de indicadores hospitalarios.

## 🚀 Despliegue

### Opción 1: Railway (Recomendado)

1. **Crear cuenta en [Railway](https://railway.app/)**
2. **Conectar repositorio GitHub**
3. **Configurar variables de entorno:**
   ```
   NODE_ENV=production
   DB_USER=tu_usuario_db
   DB_HOST=tu_host_db
   DB_NAME=tu_nombre_db
   DB_PASSWORD=tu_password_db
   DB_PORT=5432
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASS=tu_password_email
   FRONTEND_URL=https://tu-frontend.railway.app
   ```
4. **Desplegar automáticamente**

### Opción 2: Render

1. **Crear cuenta en [Render](https://render.com/)**
2. **Crear nuevo Web Service**
3. **Conectar repositorio GitHub**
4. **Configurar:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
5. **Configurar variables de entorno**
6. **Desplegar**

### Opción 3: Vercel (Solo Frontend)

1. **Crear cuenta en [Vercel](https://vercel.com/)**
2. **Conectar repositorio GitHub**
3. **Configurar variables de entorno:**
   ```
   REACT_APP_API_URL=https://tu-backend.railway.app
   ```
4. **Desplegar**

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install
cd backend && npm install
cd frontend && npm install

# Ejecutar en desarrollo
npm start
```

## 📁 Estructura del Proyecto

```
├── backend/          # API Node.js + Express
├── frontend/         # React App
├── data/            # Archivos Excel
└── docs/            # Documentación
```

## 🔧 Configuración

### Base de Datos
- PostgreSQL
- Tablas: users, establecimientos, user_establecimientos

### Email
- SMTP Gmail
- Confirmación de usuarios

### Autenticación
- JWT Tokens
- Confirmación por email

## 📧 Soporte

Para soporte técnico, contactar al administrador del sistema. 