# 📧 Configuración de Emails Reales - Tableros de Control

## 🎯 Objetivo
Configurar el sistema para enviar emails reales en lugar de emails de prueba.

## 📋 Opciones Disponibles

### 1. Gmail (Recomendado para pruebas)

#### Paso 1: Habilitar verificación en dos pasos
1. Ve a tu cuenta de Google
2. Configuración → Seguridad
3. Activa "Verificación en dos pasos"

#### Paso 2: Generar contraseña de aplicación
1. Ve a Configuración → Seguridad
2. "Contraseñas de aplicación"
3. Selecciona "Correo" y "Windows"
4. Copia la contraseña generada (16 caracteres)

#### Paso 3: Configurar el archivo
1. Copia `emailConfig.example.js` como `emailConfig.js`
2. Edita el archivo y cambia:
   ```javascript
   user: 'tu-email@gmail.com', // Tu email de Gmail
   pass: 'tu-contraseña-de-aplicacion' // La contraseña de 16 caracteres
   ```

### 2. Outlook/Hotmail

#### Paso 1: Configurar
1. Copia `emailConfig.example.js` como `emailConfig.js`
2. Descomenta la sección de Outlook
3. Configura tus credenciales:
   ```javascript
   user: 'tu-email@outlook.com',
   pass: 'tu-contraseña'
   ```

### 3. Servidor SMTP Personalizado

#### Paso 1: Configurar
1. Copia `emailConfig.example.js` como `emailConfig.js`
2. Descomenta la sección de SMTP personalizado
3. Configura los datos de tu servidor:
   ```javascript
   host: 'smtp.tu-servidor.com',
   port: 587,
   secure: false,
   auth: {
     user: 'tu-email@dominio.com',
     pass: 'tu-contraseña'
   }
   ```

## 🔧 Pasos para Configurar

### 1. Preparar el archivo de configuración
```bash
cd backend
cp emailConfig.example.js emailConfig.js
```

### 2. Editar la configuración
Abre `emailConfig.js` y configura tus credenciales según la opción elegida.

### 3. Probar la configuración
```bash
node test_email_unique.js
```

### 4. Verificar envío
- Revisa tu bandeja de entrada
- Verifica que el email llegó correctamente
- Haz clic en el enlace de confirmación

## 🛠️ Configuración Rápida con Gmail

### Opción A: Usando tu email personal
1. **Habilita verificación en dos pasos** en tu cuenta de Google
2. **Genera contraseña de aplicación** para "Correo"
3. **Edita `emailConfig.js`**:
   ```javascript
   user: 'tu-email@gmail.com',
   pass: 'abcd efgh ijkl mnop' // La contraseña de 16 caracteres
   ```

### Opción B: Crear email específico para el sistema
1. **Crea una nueva cuenta de Gmail** para el sistema
2. **Habilita verificación en dos pasos**
3. **Genera contraseña de aplicación**
4. **Configura en `emailConfig.js`**

## 🔒 Consideraciones de Seguridad

### Para Gmail:
- ✅ Usa contraseñas de aplicación (no tu contraseña principal)
- ✅ Mantén habilitada la verificación en dos pasos
- ✅ No compartas las credenciales

### Para Producción:
- ✅ Usa un servidor SMTP dedicado
- ✅ Configura SPF, DKIM y DMARC
- ✅ Monitorea los logs de envío
- ✅ Implementa rate limiting

## 🧪 Pruebas

### 1. Probar registro
```bash
node test_email_unique.js
```

### 2. Verificar envío
- Revisa la consola del backend
- Busca "Email enviado exitosamente"
- Verifica en tu bandeja de entrada

### 3. Probar confirmación
- Haz clic en el enlace del email
- Verifica que la cuenta se activa
- Prueba hacer login

## ❌ Solución de Problemas

### Error: "Invalid login"
- Verifica que la contraseña de aplicación sea correcta
- Asegúrate de que la verificación en dos pasos esté habilitada

### Error: "Username and Password not accepted"
- Usa contraseñas de aplicación, no tu contraseña principal
- Verifica que el email esté bien escrito

### Error: "Connection timeout"
- Verifica tu conexión a internet
- Asegúrate de que el puerto 587 no esté bloqueado

### Emails no llegan
- Revisa la carpeta de spam
- Verifica que el email de destino sea correcto
- Revisa los logs del backend

## 📝 Notas Importantes

1. **Gmail**: Máximo 500 emails por día (cuenta gratuita)
2. **Outlook**: Máximo 300 emails por día
3. **Producción**: Considera usar servicios como SendGrid, Mailgun o Amazon SES
4. **Seguridad**: Nunca subas las credenciales a Git
5. **Variables de entorno**: Para producción, usa variables de entorno

## 🚀 Para Producción

### Usar variables de entorno:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Crear archivo .env:
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
```

¡Con esta configuración podrás enviar emails reales a los usuarios registrados! 