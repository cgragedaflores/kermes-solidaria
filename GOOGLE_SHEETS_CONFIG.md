# Configuración de Google Sheets para Kermes Solidaria

## 📊 Pasos para conectar tu Google Sheets

### 1. Crear una hoja de Google Sheets
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nombra la primera columna: **Plato**
4. Nombra la segunda columna: **Precio**

### 2. Llenar los datos
Ejemplo:

| Plato | Precio |
|-------|--------|
| Arepa | 3.00 |
| Empanada | 2.50 |
| Tequeño | 2.00 |
| Cachapa | 4.00 |
| Pastel | 1.50 |
| Refresco | 1.00 |

### 3. Compartir la hoja
1. Haz clic en **"Compartir"** (arriba a la derecha)
2. En la ventana de compartir, haz clic en **"Cambiar"**
3. Selecciona **"Cualquiera con el enlace"**
4. Elige **"Visualizador"** como permiso
5. Copia el enlace

### 4. Obtener el ID de la hoja
Del enlace que copiaste, extrae el ID. Por ejemplo:
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit?usp=sharing
```
El ID es: `1a2b3c4d5e6f7g8h9i0j`

### 5. Actualizar el código
Abre `script.js` y busca esta línea:
```javascript
const GOOGLE_SHEET_ID = 'TU_ID_DE_HOJA_AQUI';
```

Reemplázala con tu ID:
```javascript
const GOOGLE_SHEET_ID = '1a2b3c4d5e6f7g8h9i0j';
```

### 6. ¡Listo!
Recarga la página y los platos se cargarán automáticamente.

## 🔄 Actualizar platos en tiempo real
Cada vez que recargues la página, se descargarán los datos más recientes de Google Sheets. Así que puedes:
- Agregar nuevos platos
- Cambiar precios
- Cambiar emojis
- Eliminar platos

Los cambios se reflejarán inmediatamente en la app.

## ⚠️ Formato requerido
- **Plato**: Texto libre
- **Precio**: Número con decimales (ej: 3.50)

## 💡 Ejemplo de hoja completa
```
Plato,Precio
Arepa,3.00
Empanada,2.50
Tequeño,2.00
Cachapa,4.00
Pastel,1.50
Refresco,1.00
Bebida grande,2.00
Agua,0.50
```

## 🆘 Si no funciona
1. Verifica que el formato CSV sea correcto
2. Abre la consola (F12) y mira los errores
3. Asegúrate de que la hoja esté compartida
4. La app usará platos locales como respaldo si hay error
