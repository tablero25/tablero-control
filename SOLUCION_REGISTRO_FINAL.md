# 🔧 SOLUCIÓN COMPLETA PARA REGISTRO DE USUARIOS

## 🚨 PROBLEMA IDENTIFICADO
- Servidor de producción caído (Error 502)
- Rutas de API no funcionan correctamente
- Sistema de registro inaccesible

## 🛠️ SOLUCIÓN PASO A PASO

### PASO 1: SUBIR LOS CAMBIOS CORREGIDOS
```bash
git add .
git commit -m "Fix registro usuarios - Eliminadas rutas duplicadas"
git push origin main
```

### PASO 2: VERIFICAR EL SERVIDOR
El servidor en Render necesita ser reiniciado después de subir los cambios.

### PASO 3: SOLUCIÓN TEMPORAL - USUARIOS LOCALES
Mientras se arregla el servidor, puedes crear usuarios localmente:

#### Opción A: Usar el script de reset existente
```bash
node backend/reset_users.js
```

#### Opción B: Crear usuario manual
```bash
# Usar el endpoint de reset que funciona
curl -X POST https://tablero-control-1.onrender.com/api/reset-users
```

### PASO 4: VERIFICAR QUE FUNCIONA
```bash
# Probar el login con usuario creado
# Usuario: 12345678
# Contraseña: 12345678
```

## 📋 USUARIOS POR DEFECTO DESPUÉS DEL RESET
- **DNI:** 12345678
- **Contraseña:** 12345678
- **Rol:** admin

## 🎯 RESULTADO ESPERADO
- ✅ Sistema de registro funcionando
- ✅ Usuarios pueden registrarse
- ✅ Login funcionando correctamente
- ✅ Servidor estable

## 🚀 COMANDOS PARA EJECUTAR AHORA
1. `git add .`
2. `git commit -m "Fix registro usuarios"`
3. `git push origin main`
4. Esperar 2-3 minutos para que Render actualice
5. Probar el registro en la aplicación 