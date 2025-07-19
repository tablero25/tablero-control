# 🔒 GUÍA DE VALIDACIÓN DE ARCHIVOS

## ✅ **PROBLEMA RESUELTO**

**Antes:** Se podían subir archivos Excel de cualquier tipo a cualquier categoría
**Ahora:** El sistema valida que el archivo coincida con la categoría seleccionada

## 🎯 **CÓMO FUNCIONA LA VALIDACIÓN**

### 1. **Detección Automática de Contenido**
El sistema lee el título del archivo Excel y verifica que contenga las palabras clave correctas:

| **Categoría Seleccionada** | **Palabras Clave Requeridas** |
|---------------------------|-------------------------------|
| Ranking de diagnóstico de emergencia | EMERGENCIA, URGENCIA |
| Ranking de diagnósticos de atención | ATENCIÓN, ATENCION |
| Ranking de mortalidad | MORTALIDAD, MUERTE, FALLECIDO |
| Ranking de motivos de egresos | EGRESO, EGRESOS, ALTA, MOTIVO |

### 2. **Validación en Tiempo Real**
- ✅ **Archivo correcto**: Se guarda normalmente
- ❌ **Archivo incorrecto**: Se rechaza y se elimina automáticamente
- 📋 **Mensaje específico**: Muestra por qué fue rechazado

## 📋 **EJEMPLOS DE FUNCIONAMIENTO**

### ✅ **CASO EXITOSO**
```
Categoría seleccionada: "Ranking de mortalidad"
Archivo subido: "ranking_mortalidad_ejemplo.xls"
Título del archivo: "HOSPITAL RANKING DE MORTALIDAD"
Resultado: ✅ ACEPTADO (contiene "MORTALIDAD")
```

### ❌ **CASO RECHAZADO**
```
Categoría seleccionada: "Ranking de mortalidad"
Archivo subido: "ranking_atencion_ejemplo.xls"
Título del archivo: "HOSPITAL RANKING DE DIAGNÓSTICOS DE ATENCIÓN"
Resultado: ❌ RECHAZADO (no contiene "MORTALIDAD", "MUERTE" o "FALLECIDO")
Error: "El archivo no corresponde a la categoría 'Ranking de mortalidad'"
```

## 🧪 **ARCHIVOS DE PRUEBA DISPONIBLES**

He creado archivos de ejemplo en `backend/test_files/`:

- ✅ `ranking_emergencia_ejemplo.xls` → Solo para "Ranking de diagnóstico de emergencia"
- ✅ `ranking_atencion_ejemplo.xls` → Solo para "Ranking de diagnósticos de atención"  
- ✅ `ranking_mortalidad_ejemplo.xls` → Solo para "Ranking de mortalidad"
- ✅ `ranking_motivos_egresos_ejemplo.xls` → Solo para "Ranking de motivos de egresos"
- ❌ `archivo_incorrecto_ejemplo.xls` → Será rechazado por cualquier categoría

## 🔧 **MENSAJES DE ERROR**

### Frontend (lo que ve el usuario):
```
❌ ARCHIVO INCORRECTO: El archivo no corresponde a la categoría "Ranking de mortalidad". 
Título encontrado: "HOSPITAL RANKING DE DIAGNÓSTICOS DE ATENCIÓN". 
Verifique que el archivo sea del tipo correcto.
```

### Backend (logs del servidor):
```
❌ TÍTULO NO VÁLIDO para categoría "Ranking de mortalidad"
📋 Título encontrado: "HOSPITAL RANKING DE DIAGNÓSTICOS DE ATENCIÓN"
🔍 Palabras clave esperadas: MORTALIDAD, MUERTE, FALLECIDO
```

## 🎯 **BENEFICIOS**

1. **Previene errores**: No se pueden subir archivos a categorías incorrectas
2. **Organización automática**: Los archivos se guardan en el lugar correcto
3. **Mensajes claros**: El usuario sabe exactamente qué está mal
4. **Limpieza automática**: Los archivos rechazados se eliminan automáticamente
5. **Validación en tiempo real**: No hay que esperar a procesar para saber si está mal

## 🚀 **CÓMO PROBAR**

1. Ve a la aplicación web
2. Selecciona una categoría (ej: "Ranking de mortalidad")
3. Intenta subir un archivo de otra categoría (ej: `ranking_atencion_ejemplo.xls`)
4. Observa el mensaje de error específico
5. Sube el archivo correcto (ej: `ranking_mortalidad_ejemplo.xls`)
6. Verifica que se acepta correctamente

## 🔍 **DETALLES TÉCNICOS**

- **Búsqueda**: Revisa las primeras 10 filas del Excel
- **Título**: Busca celdas que contengan "RANKING" con más de 10 caracteres
- **Validación**: Verifica que el título contenga al menos una palabra clave de la categoría
- **Limpieza**: Elimina archivos rechazados del sistema de archivos
- **Logging**: Registra todos los intentos de validación para debugging

¡La validación está completamente implementada y funcionando! 🎉 