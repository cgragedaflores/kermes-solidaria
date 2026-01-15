# 🎪 Kermes Solidaria - Web App Responsive

Una aplicación web moderna, accesible y responsive especialmente diseñada para adultos mayores. Ideal para promocionar eventos benéficos, kermeses solidarias y actividades comunitarias.

## 📋 Características Principales

### ✅ Diseño Accesible para Adultos Mayores
- **Letras muy grandes**: Tamaños de fuente optimizados (mínimo 20px)
- **Alto contraste**: Colores vibrantes y fáciles de distinguir
- **Navegación simple**: Botones grandes con iconos y texto claro
- **Interfaz intuitiva**: Sin elementos complicados o confusos

### 📱 Responsive Design
- **Dispositivos móviles**: Optimizado para pantallas pequeñas
- **Tablets**: Adaptación perfecta a pantallas medianas
- **Computadoras**: Experiencia completa en escritorio
- **Flexibilidad**: Se ajusta automáticamente a cualquier tamaño

### 🎨 Características Técnicas
- HTML5 semántico
- CSS3 moderno (Grid, Flexbox)
- JavaScript vanilla (sin dependencias)
- Animaciones suaves y transiciones
- Modo oscuro automático (según preferencia del sistema)
- Compatible con lectores de pantalla
- Navegación por teclado

### 📊 Secciones Incluidas
1. **Inicio**: Bienvenida y características principales
2. **Información**: Detalles del evento (fecha, lugar, entrada)
3. **Actividades**: Listado de atracciones disponibles
4. **Horario**: Línea de tiempo del evento
5. **Ayudar**: Formas de donación e impacto
6. **Contacto**: Información de contacto y formulario

## 🚀 Cómo Usar

### Instalación
1. Descarga los archivos del proyecto
2. Asegúrate de tener estos archivos en la misma carpeta:
   - `index.html`
   - `styles.css`
   - `script.js`

### Ejecutar Localmente
- **Opción 1**: Abre `index.html` directamente en tu navegador
- **Opción 2**: Usa un servidor local:
  ```bash
  # Con Python 3
  python -m http.server 8000
  
  # Con Python 2
  python -m SimpleHTTPServer 8000
  
  # Con Node.js (si tienes http-server instalado)
  http-server
  ```

## 🎯 Personalización

### Cambiar Información del Evento
Abre `index.html` y busca estas secciones:

**Fecha y Hora**:
```html
<strong>Sábado 22 de Marzo de 2025</strong><br>
Desde las 10:00 AM hasta las 6:00 PM
```

**Ubicación**:
```html
<strong>Parque Central</strong><br>
Calle Principal 123
```

**Teléfono de Contacto**:
```html
<p class="contact-detail">(+57) 1 234-5678</p>
```

**Email**:
```html
<p class="contact-detail">info@kermes.org</p>
```

### Cambiar Colores
En `styles.css`, modifica las variables en `:root`:
```css
--primary-color: #FF6B35;      /* Color principal (naranja) */
--secondary-color: #004E89;    /* Color secundario (azul) */
--success-color: #2A9D8F;      /* Color de éxito (verde) */
--warning-color: #E76F51;      /* Color de alerta (rojo) */
```

### Cambiar Tamaños de Fuente
En `styles.css`:
```css
--font-size-base: 20px;        /* Tamaño base */
--font-size-lg: 24px;          /* Tamaño grande */
--font-size-xl: 28px;          /* Muy grande */
--font-size-xxl: 36px;         /* Extra grande */
--font-size-title: 48px;       /* Título principal */
```

## ♿ Características de Accesibilidad

- **Navegación por teclado**: Tab, Shift+Tab, Enter, Escape
- **Focus visible**: Bordes claros al navegar con teclado
- **Lectores de pantalla**: Semántica HTML correcta
- **Modo oscuro**: Respeta la preferencia del usuario
- **Movimiento reducido**: Respeta `prefers-reduced-motion`
- **Alto contraste**: Relación de contraste WCAG AA+
- **Tamaños táctiles**: Botones de 60px mínimo en móvil

## 📂 Estructura de Archivos

```
KermesSolidaria/
├── index.html       # Estructura principal
├── styles.css       # Estilos y responsive
├── script.js        # Interactividad y lógica
└── README.md        # Este archivo
```

## 🔧 Funcionalidades JavaScript

### Navegación
- Cambio automático de secciones
- Historial del navegador
- Scroll suave

### Formulario de Contacto
- Validación de campos
- Validación de email
- Mensaje de confirmación
- Simulación de envío

### Interactividad
- Efectos hover en tarjetas
- Animación de números en impacto
- Modal de confirmación
- Anuncios para lectores de pantalla

## 🌐 Compatibilidad

- ✅ Chrome/Chromium (versión 80+)
- ✅ Firefox (versión 75+)
- ✅ Safari (versión 13+)
- ✅ Edge (versión 80+)
- ✅ Opera (versión 67+)

## 📞 Soporte

Para reportar problemas o sugerencias:
1. Verifica la consola del navegador (F12)
2. Intenta en otro navegador
3. Limpia el caché del navegador
4. Contacta al equipo de desarrollo

## 📝 Notas de Desarrollo

### Para Agregar Nuevas Secciones
1. Agrega un botón en la barra de navegación:
```html
<button class="nav-button" data-section="nueva-seccion">
    <span class="nav-icon">🆕</span>
    <span>Nueva</span>
</button>
```

2. Agrega la sección en el contenido:
```html
<section id="nueva-seccion" class="content-section">
    <h2>Nueva Sección</h2>
    <!-- Contenido aquí -->
</section>
```

3. El JavaScript las conectará automáticamente

### Para Enviar el Formulario a un Servidor
Modifica la función `enviarFormulario()` en `script.js`:
```javascript
fetch('/api/contacto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, telefono, asunto, mensaje })
})
```

## 📜 Licencia

Libre para usar y modificar. Perfecto para eventos comunitarios y benéficos.

## 🎉 ¡Que disfrutes la Kermes Solidaria!

Creado con ❤️ para la comunidad

---

**Versión**: 1.0  
**Última actualización**: Enero 2025  
**Optimizado para**: Adultos mayores y usuarios con necesidades de accesibilidad
