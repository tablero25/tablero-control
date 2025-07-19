# Sistema de Confirmación por Email - Tableros de Control

## 📧 Resumen del Sistema

Se ha implementado un sistema completo de confirmación por email para el registro de usuarios en el sistema de Tableros de Control. Los usuarios ahora deben confirmar su cuenta por email antes de poder iniciar sesión.

## 🔧 Componentes Implementados

### Backend

1. **emailConfig.js** - Configuración de envío de emails usando Nodemailer
2. **tokenUtils.js** - Utilidades para generar y validar tokens de confirmación
3. **authRoutes.js** - Rutas actualizadas para manejar confirmación por email
4. **Base de datos** - Campos agregados para confirmación

### Frontend

1. **ConfirmUser.js** - Página de confirmación de usuario
2. **ConfirmUser.css** - Estilos para la página de confirmación
3. **Register.js** - Formulario de registro actualizado
4. **App.js** - Rutas actualizadas

## 🚀 Flujo de Confirmación

### 1. Registro de Usuario
```
Usuario se registra → Se crea con is_active = false → Se envía email de confirmación
```

### 2. Email de Confirmación
- Se genera un token único de 32 caracteres
- El token expira en 24 horas
- Se envía un email con enlace de confirmación
- El email incluye información de acceso (usuario y contraseña inicial)

### 3. Confirmación
```
Usuario hace clic en enlace → Se valida token → Se activa cuenta → Usuario puede hacer login
```

### 4. Reenvío de Email
- Si el token expira, el usuario puede solicitar un nuevo email
- Se genera un nuevo token y se actualiza en la base de datos

## 📋 Campos de Base de Datos Agregados

```sql
ALTER TABLE users ADD COLUMN:
- dni VARCHAR(20) UNIQUE
- nombre VARCHAR(100)
- apellido VARCHAR(100)
- funcion VARCHAR(100)
- first_login BOOLEAN DEFAULT TRUE
- confirmation_token VARCHAR(255)
- confirmation_expires TIMESTAMP
```

## 🔗 Rutas API Implementadas

### POST /api/auth/register
- Registra usuario con `is_active = false`
- Genera token de confirmación
- Envía email de confirmación
- Asigna rol ESTABLECIMIENTO automáticamente

### GET /api/auth/confirm/:token
- Valida token de confirmación
- Activa usuario (`is_active = true`)
- Limpia token de confirmación

### POST /api/auth/resend-confirmation
- Reenvía email de confirmación
- Genera nuevo token
- Actualiza fecha de expiración

## 🎨 Página de Confirmación

### URL: `/confirmar-usuario?token=TOKEN_AQUI`

**Estados de la página:**
- **Loading**: Mientras se procesa la confirmación
- **Success**: Usuario confirmado exitosamente
- **Expired**: Token expirado (opción de reenvío)
- **Error**: Token inválido o error de conexión

## 📧 Configuración de Email

### Desarrollo (Ethereal Email)
- Usa Ethereal Email para pruebas
- Los emails no se envían realmente
- Se genera URL de vista previa en la consola del backend

### Producción
Para usar en producción, modificar `emailConfig.js`:

```javascript
const transporter = nodemailer.createTransporter({
  host: 'tu-servidor-smtp.com',
  port: 587,
  secure: false,
  auth: {
    user: 'tu-email@dominio.com',
    pass: 'tu-contraseña'
  },
});
```

## 🧪 Pruebas del Sistema

### Scripts de Prueba Creados
1. `test_email_confirmation.js` - Prueba completa del sistema
2. `test_simple_register.js` - Prueba de registro directo
3. `test_final_confirmation.js` - Prueba final del sistema

### Cómo Probar
1. Ejecutar: `node test_final_confirmation.js`
2. Revisar consola del backend para URL de vista previa
3. Hacer clic en enlace de confirmación
4. Verificar que se puede hacer login después

## 🔒 Seguridad

### Tokens de Confirmación
- Tokens únicos de 32 bytes (hex)
- Expiración de 24 horas
- Se limpian después de confirmación
- No se pueden reutilizar

### Validaciones
- Usuarios no confirmados no pueden hacer login
- Tokens expirados se rechazan
- Emails duplicados se validan
- DNI único por usuario

## 📱 Interfaz de Usuario

### Mensajes Informativos
- Registro exitoso con instrucciones de confirmación
- Estados claros en página de confirmación
- Opciones de reenvío si token expira
- Navegación fácil entre páginas

### Diseño Responsivo
- Página de confirmación adaptada a móviles
- Botones claros y accesibles
- Iconos visuales para cada estado
- Colores consistentes con el sistema

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias
```bash
cd backend
npm install nodemailer
```

### 2. Actualizar Base de Datos
```bash
node update_database.js
```

### 3. Verificar Configuración
```bash
node test_final_confirmation.js
```

## 📝 Notas Importantes

1. **Emails de Prueba**: En desarrollo, los emails se envían a Ethereal Email
2. **Tokens Únicos**: Cada token es único y no se puede reutilizar
3. **Expiración**: Los tokens expiran en 24 horas por seguridad
4. **Roles**: Todos los usuarios registrados obtienen rol ESTABLECIMIENTO
5. **Contraseña Inicial**: La contraseña inicial es el DNI del usuario

## 🔄 Flujo Completo de Usuario

1. **Registro**: Usuario completa formulario de registro
2. **Email**: Recibe email con enlace de confirmación
3. **Confirmación**: Hace clic en enlace y confirma cuenta
4. **Login**: Puede iniciar sesión con DNI como contraseña
5. **Cambio de Contraseña**: Debe cambiar contraseña en primer login

## ✅ Estado Actual

- ✅ Sistema de confirmación por email implementado
- ✅ Base de datos actualizada con campos necesarios
- ✅ Frontend con página de confirmación
- ✅ Backend con rutas de confirmación
- ✅ Validaciones de seguridad
- ✅ Sistema de reenvío de emails
- ✅ Interfaz de usuario completa
- ✅ Pruebas automatizadas

El sistema está listo para uso en producción con la configuración de email apropiada. 