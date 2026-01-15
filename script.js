/* ============================================
   SCRIPT SIMPLE - KERMES SOLIDARIA
   ============================================ */

// Variables globales
let cantidad = 1;
let platoActual = '';
let precioUnitario = 0;
let platos = {}; // Se cargará desde Google Sheets
let bebidas = {}; // Bebidas separadas
let tipo_seleccion = ''; // 'plato' o 'bebida'

// Sistema de carrito
let carrito = []; // Items agregados antes de cobrar

// Sistema de transacciones
let transacciones = []; // Array de todas las transacciones

// Cargar transacciones del localStorage
function cargarTransacciones() {
    const datos = localStorage.getItem('kermes_transacciones');
    if (datos) {
        transacciones = JSON.parse(datos);
    }
}

// Guardar transacciones en localStorage
function guardarTransacciones() {
    localStorage.setItem('kermes_transacciones', JSON.stringify(transacciones));
}

// Registrar una transacción
async function registrarTransaccion(plato, cantidad, precio, tipoPago) {
    const transaccion = {
        id: Date.now(),
        plato: plato,
        cantidad: cantidad,
        precioUnitario: precio,
        total: (cantidad * precio).toFixed(2),
        tipoPago: tipoPago, // 'efectivo' o 'qr'
        fecha: new Date().toLocaleString('es-VE'),
        hora: new Date().toLocaleTimeString('es-VE')
    };

    transacciones.push(transaccion);
    guardarTransacciones();
    actualizarTotalRecaudado();

    // Enviar a Google Sheets y esperar respuesta
    await enviarAGoogleSheets(transaccion);
}

// Enviar datos a Google Sheets a través del Apps Script
async function enviarAGoogleSheets(transaccion) {
    const data = {
        plato: transaccion.plato,
        cantidad: transaccion.cantidad,
        tipoPago: transaccion.tipoPago,
        total: transaccion.total
    };

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    } catch (err) {
        console.log('Venta registrada localmente');
    }
}

// Calcular totales
function calcularTotales() {
    const totales = {
        general: 0,
        efectivo: 0,
        qr: 0,
        cantidad: 0
    };

    transacciones.forEach(t => {
        const total = parseFloat(t.total);
        totales.general += total;
        totales.cantidad += t.cantidad;

        if (t.tipoPago === 'efectivo') {
            totales.efectivo += total;
        } else if (t.tipoPago === 'qr') {
            totales.qr += total;
        }
    });

    return totales;
}

// Actualizar el total en el header
function actualizarTotalRecaudado() {
    const totales = calcularTotales();
    document.getElementById('totalRecaudado').textContent = `Bs ${totales.general.toFixed(2)}`;
}

// ============================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ============================================
// ID de tu hoja de Google Sheets
const GOOGLE_SHEET_ID = '1_D5ZBRypn13cY5IwD7g9ejHuZCNSNREXbVTtf0JUtuw';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
const VENTAS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Ventas`;

// URL del Google Apps Script para registrar ventas
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdKmcnq6bSnp_bncY-M46dsIqIbS3EyzgtOtUFeaN4SeMUjI1HPvNqiMvfhyGmWMfS/exec';

// ============================================
// CARGAR PLATOS DESDE GOOGLE SHEETS
// ============================================
async function cargarPlatosDesdeGoogle() {
    try {
        const response = await fetch(SHEET_URL);
        const csv = await response.text();

        // Parsear CSV
        const lineas = csv.trim().split('\n');
        
        // Separar comidas y bebidas
        platos = {};
        bebidas = {};

        // Saltar encabezado (primera fila)
        for (let i = 1; i < lineas.length; i++) {
            const [nombre, precio] = lineas[i].split(',').map(v => v.trim());

            if (nombre && precio) {
                const id = nombre.toLowerCase().replace(/\s+/g, '_');

                // Identificar si es bebida (contiene palabras clave)
                if (nombre.toLowerCase().includes('cerveza') ||
                    nombre.toLowerCase().includes('bebida') ||
                    nombre.toLowerCase().includes('chicha') ||
                    nombre.toLowerCase().includes('refresco')) {
                    bebidas[id] = { nombre: nombre, precio: parseFloat(precio) };
                } else {
                    platos[id] = { nombre: nombre, precio: parseFloat(precio) };
                }
            }
        }

        // Llenar los selects
        llenarSelectPlatos();
        llenarSelectBebidas();
        console.log('✅ Platos cargados desde Google Sheets');
    } catch (error) {
        console.error('❌ Error cargando Google Sheets:', error);
        console.log('⚠️ Usando datos locales de respaldo');
        mostrarError('No se pudieron cargar los platos. Verifica tu Google Sheet ID.');
        cargarPlatosLocales();
    }
}

// ============================================
// PLATOS LOCALES (si Google Sheets falla)
// ============================================
function cargarPlatosLocales() {
    console.log('📦 Cargando platos locales de respaldo');
    platos = {
        arepa: { nombre: 'Picante', precio: 30.00 },
        empanada: { nombre: 'Keperi al Horno', precio: 30.00 },
        tequeño: { nombre: 'Lechon al Horno', precio: 30.00 },
        cachapa: { nombre: 'Sopa de Mani', precio: 15.00 }
    };
    bebidas = {
        chicha: { nombre: 'Chicha', precio: 3.00 },
        cerveza: { nombre: 'Cerveza', precio: 25.00 },
        cervezas_oferta: { nombre: '2 Cervezas - Oferta', precio: 45.00 }
    };
    llenarSelectPlatos();
    llenarSelectBebidas();
}

// ============================================
// LLENAR SELECT CON PLATOS
// ============================================
function llenarSelectPlatos() {
    const select = document.getElementById('platoSelect');
    select.innerHTML = '<option value="">-- Selecciona una comida --</option>';

    for (const [id, plato] of Object.entries(platos)) {
        const option = document.createElement('option');
        option.value = id;
        option.setAttribute('data-precio', plato.precio.toFixed(2));
        option.textContent = `${plato.nombre} (Bs ${plato.precio.toFixed(2)})`;
        select.appendChild(option);
    }
}

// ============================================
// LLENAR SELECT CON BEBIDAS
// ============================================
function llenarSelectBebidas() {
    const select = document.getElementById('bebidaSelect');
    select.innerHTML = '<option value="">-- Selecciona una bebida --</option>';

    for (const [id, bebida] of Object.entries(bebidas)) {
        const option = document.createElement('option');
        option.value = id;
        option.setAttribute('data-precio', bebida.precio.toFixed(2));
        option.textContent = `${bebida.nombre} (Bs ${bebida.precio.toFixed(2)})`;
        select.appendChild(option);
    }
}

// ============================================
// MOSTRAR ERROR
// ============================================
function mostrarError(mensaje) {
    console.error(mensaje);
}

// Cambiar plato seleccionado
function cambiarPlato() {
    const id = document.getElementById('platoSelect').value;
    
    if (!id) {
        if (!document.getElementById('bebidaSelect').value) {
            platoActual = '';
            precioUnitario = 0;
            tipo_seleccion = '';
            actualizarDisplay();
        }
        return;
    }

    platoActual = id;
    precioUnitario = platos[id].precio;
    tipo_seleccion = 'plato';
    cantidad = 1;
    actualizarDisplay();
}

// Cambiar bebida seleccionada
function cambiarBebida() {
    const id = document.getElementById('bebidaSelect').value;
    
    if (!id) {
        if (!document.getElementById('platoSelect').value) {
            platoActual = '';
            precioUnitario = 0;
            tipo_seleccion = '';
            actualizarDisplay();
        }
        return;
    }

    platoActual = id;
    precioUnitario = bebidas[id].precio;
    tipo_seleccion = 'bebida';
    cantidad = 1;
    actualizarDisplay();
}

// ============================================
// SISTEMA DE CARRITO
// ============================================
function agregarAlCarrito() {
    if (!platoActual) {
        alert('Selecciona un plato o bebida primero');
        return;
    }

    const nombre_item = tipo_seleccion === 'bebida' ? bebidas[platoActual].nombre : platos[platoActual].nombre;
    const total = (cantidad * precioUnitario);

    carrito.push({
        id: Date.now(),
        nombre: nombre_item,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        total: total
    });

    actualizarCarrito();

    // Limpiar selección
    document.getElementById('platoSelect').value = '';
    document.getElementById('bebidaSelect').value = '';
    platoActual = '';
    cantidad = 1;
    actualizarDisplay();

    alert(`✓ ${nombre_item} x${cantidad} agregado al carrito`);
}

function actualizarCarrito() {
    const container = document.getElementById('carritoContainer');
    const lista = document.getElementById('carritoLista');
    const totalSpan = document.getElementById('carritoTotal');

    if (carrito.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    // Renderizar items
    lista.innerHTML = carrito.map((item, index) => `
        <div class="carrito-item">
            <div class="carrito-item-info">
                <strong>${item.nombre}</strong>
                <div class="carrito-item-controls">
                    <button class="btn-cantidad-carrito" onclick="modificarCantidadCarrito(${index}, -1)">−</button>
                    <span class="cantidad-carrito">x${item.cantidad}</span>
                    <button class="btn-cantidad-carrito" onclick="modificarCantidadCarrito(${index}, 1)">+</button>
                </div>
                <span class="carrito-item-precio">Bs ${item.total.toFixed(2)}</span>
            </div>
            <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${index})">🗑️</button>
        </div>
    `).join('');

    // Calcular total
    const total = carrito.reduce((sum, item) => sum + item.total, 0);
    totalSpan.textContent = total.toFixed(2);
}

function modificarCantidadCarrito(index, cambio) {
    carrito[index].cantidad += cambio;
    
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    } else {
        carrito[index].total = carrito[index].cantidad * carrito[index].precioUnitario;
    }
    
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

// Aumentar cantidad
function aumentar() {
    if (platoActual) {
        cantidad++;
        actualizarDisplay();
    } else {
        alert('Por favor selecciona un plato primero');
    }
}

// Disminuir cantidad
function disminuir() {
    if (platoActual && cantidad > 1) {
        cantidad--;
        actualizarDisplay();
    }
}

// Actualizar display
function actualizarDisplay() {
    if (platoActual) {
        const nombre_item = tipo_seleccion === 'bebida' ? bebidas[platoActual].nombre : platos[platoActual].nombre;
        document.getElementById('platoActual').textContent = nombre_item;
        document.getElementById('cantidad').textContent = cantidad;
    } else {
        document.getElementById('platoActual').textContent = 'Selecciona un plato o bebida';
    }
}

// Mostrar Total
function mostrarTotal() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agrega items primero.');
        return;
    }
    const total = carrito.reduce((sum, item) => sum + item.total, 0);
    const detalles = carrito.map(item => `${item.nombre} x${item.cantidad} - Bs ${item.total.toFixed(2)}`).join('\n');
    alert(`TOTAL CARRITO: Bs ${total.toFixed(2)}\n\n${detalles}`);
}

// Cobrar con efectivo
async function cobrarEfectivo() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agrega items primero.');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + item.total, 0);
    const detalles = carrito.map(item => `${item.nombre} x${item.cantidad}`).join('\n');
    
    alert(`✓ EFECTIVO RECIBIDO\n\n${detalles}\n\nTotal: Bs ${total.toFixed(2)}\n\n¡Gracias por tu compra!`);
    
    // Registrar cada item del carrito
    for (const item of carrito) {
        await registrarTransaccion(item.nombre, item.cantidad, item.precioUnitario, 'efectivo');
    }
    
    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    document.getElementById('platoSelect').value = '';
    document.getElementById('bebidaSelect').value = '';
    platoActual = '';
    cantidad = 1;
    actualizarDisplay();
}

// Cobrar con QR
async function cobrarQR() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agrega items primero.');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + item.total, 0);
    const detalles = carrito.map(item => `${item.nombre} x${item.cantidad}`).join('\n');
    
    alert(`✓ PAGO QR REGISTRADO\n\n${detalles}\n\nTotal: Bs ${total.toFixed(2)}\n\n¡Gracias por tu compra!`);
    
    // Registrar cada item del carrito
    for (const item of carrito) {
        await registrarTransaccion(item.nombre, item.cantidad, item.precioUnitario, 'qr');
    }
    
    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    document.getElementById('platoSelect').value = '';
    document.getElementById('bebidaSelect').value = '';
    platoActual = '';
    cantidad = 1;
    actualizarDisplay();
}

// Generar QR simple
function generarQR(text, canvas) {
    // Para una solución completa, necesitarías QRCode.js
    // Por ahora mostramos un placeholder
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    // Dibujar cuadrado blanco
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 300, 300);

    // Dibujar patrón QR simple
    ctx.fillStyle = '#000';
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (Math.random() > 0.5) {
                ctx.fillRect(i * 30, j * 30, 30, 30);
            }
        }
    }

    // Dibujar borde
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 300, 300);
}

// Cerrar modal QR
function cerrarModalQR() {
    document.getElementById('modalQR').classList.remove('show');
}

// Cobrar
function cobrar() {
    if (!platoActual) {
        alert('Por favor selecciona un plato primero');
        return;
    }
    const total = (cantidad * precioUnitario).toFixed(2);
    const platoNombre = platos[platoActual].nombre;
    const confirmacion = confirm(`¿Confirmar cobro?\n\n${platoNombre}\nCantidad: ${cantidad}\nTotal: Bs ${total}`);

    if (confirmacion) {
        alert(`✓ COBRO REALIZADO\n\n${platoNombre}\nCantidad: ${cantidad}\nBs ${total}\n\n¡Gracias por tu aporte a la Kermes Solidaria!`);
        registrarTransaccion(platoNombre, cantidad, precioUnitario, 'efectivo');
        document.getElementById('platoSelect').value = '';
        platoActual = '';
        cantidad = 1;
        actualizarDisplay();
    }
}

// Permitir entrada de cantidad manual
document.getElementById('platoSelect').addEventListener('change', cambiarPlato);

// Crear modal QR si no existe
document.addEventListener('DOMContentLoaded', () => {
    // Crear modal QR
    if (!document.getElementById('modalQR')) {
        const modal = document.createElement('div');
        modal.id = 'modalQR';
        modal.className = 'modal-qr';
        modal.innerHTML = `
            <div class="qr-content">
                <h2>Código QR</h2>
                <p id="qrInfo"></p>
                <canvas id="qrCanvas" width="300" height="300"></canvas>
                <button onclick="cerrarModalQR()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Crear modal Resumen
    if (!document.getElementById('modalResumen')) {
        const modal = document.createElement('div');
        modal.id = 'modalResumen';
        modal.className = 'modal-resumen';
        modal.innerHTML = `
            <div class="resumen-content">
                <h2>📊 RESUMEN DE VENTAS</h2>
                <div class="resumen-stats">
                    <div class="resumen-stat">
                        <div class="resumen-stat-label">Total Recaudado</div>
                        <div class="resumen-stat-value" id="resumenTotal">Bs 0.00</div>
                    </div>
                    <div class="resumen-stat">
                        <div class="resumen-stat-label">Total Ventas</div>
                        <div class="resumen-stat-value" id="resumenCantidad">0</div>
                    </div>
                    <div class="resumen-stat">
                        <div class="resumen-stat-label">Efectivo</div>
                        <div class="resumen-stat-value" id="resumenEfectivo">Bs 0.00</div>
                    </div>
                    <div class="resumen-stat">
                        <div class="resumen-stat-label">QR</div>
                        <div class="resumen-stat-value" id="resumenQR">Bs 0.00</div>
                    </div>
                </div>
                <div class="transacciones-list" id="transaccionesList"></div>
                <div class="resumen-buttons">
                    <button class="btn-cerrar-resumen" onclick="cerrarModalResumen()">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Cargar transacciones del localStorage como respaldo
    cargarTransacciones();

    // Cargar platos desde Google Sheets
    cargarPlatosDesdeGoogle();
    
    // Cargar ventas desde Google Sheets y actualizar total
    cargarVentasDesdeGoogleSheets();
});

// Mostrar modal de resumen
async function mostrarResumen() {
    // Cargar ventas desde Google Sheets
    await cargarVentasDesdeGoogleSheets();
    
    const totales = calcularTotales();

    document.getElementById('resumenTotal').textContent = `Bs ${totales.general.toFixed(2)}`;
    document.getElementById('resumenCantidad').textContent = totales.cantidad;
    document.getElementById('resumenEfectivo').textContent = `Bs ${totales.efectivo.toFixed(2)}`;
    document.getElementById('resumenQR').textContent = `Bs ${totales.qr.toFixed(2)}`;

    // Mostrar transacciones
    const listHTML = transacciones.map(t => `
        <div class="transaccion-item">
            <div class="transaccion-plato">${t.plato} (x${t.cantidad})</div>
            <div class="transaccion-detalles">
                <strong>Bs ${t.total}</strong> | ${t.tipoPago === 'efectivo' ? '💵 EFECTIVO' : '📱 QR'} | ${t.hora}
            </div>
        </div>
    `).join('');

    document.getElementById('transaccionesList').innerHTML = listHTML || '<p style="text-align: center; color: #999;">No hay transacciones registradas</p>';

    document.getElementById('modalResumen').classList.add('show');
}

// Cargar ventas desde Google Sheets
async function cargarVentasDesdeGoogleSheets() {
    try {
        const response = await fetch(VENTAS_SHEET_URL);
        const csv = await response.text();
        
        // Parsear CSV
        const lineas = csv.trim().split('\n');
        transacciones = [];
        
        // Saltar encabezado (primera fila)
        for (let i = 1; i < lineas.length; i++) {
            // Formato CSV: Plato, Cantidad, Tipo de Pago, Total, Hora
            const valores = lineas[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!valores || valores.length < 4) continue;
            
            const plato = valores[0].replace(/^"|"$/g, '').trim();
            const cantidad = parseInt(valores[1].replace(/^"|"$/g, '').trim());
            const tipoPago = valores[2].replace(/^"|"$/g, '').trim().toLowerCase();
            const total = parseFloat(valores[3].replace(/^"|"$/g, '').trim());
            const hora = valores[4] ? valores[4].replace(/^"|"$/g, '').trim() : '';
            
            if (plato && !isNaN(cantidad) && !isNaN(total)) {
                transacciones.push({
                    id: Date.now() + i,
                    plato: plato,
                    cantidad: cantidad,
                    precioUnitario: total / cantidad,
                    total: total.toFixed(2),
                    tipoPago: tipoPago,
                    fecha: new Date().toLocaleDateString('es-VE'),
                    hora: hora
                });
            }
        }
        
        console.log('✅ Ventas cargadas desde Google Sheets:', transacciones.length);
        actualizarTotalRecaudado();
    } catch (error) {
        console.error('❌ Error cargando ventas desde Google Sheets:', error);
        console.log('⚠️ Usando datos locales de localStorage');
        cargarTransacciones();
    }
}

// Cerrar modal de resumen
function cerrarModalResumen() {
    document.getElementById('modalResumen').classList.remove('show');
}

// Cerrar modal al presionar Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modalQR');
        if (modal) modal.classList.remove('show');
    }
});
