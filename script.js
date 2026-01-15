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
    } catch(err) {
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

// URL del Google Apps Script para registrar ventas
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdKmcnq6bSnp_bncY-M46dsIqIbS3EyzgtOtUFeaN4SeMUjI1HPvNqiMvfhyGmWMfS/exec';

// ============================================
// CARGAR PLATOS DESDE GOOGLE SHEETS
// ============================================
async function cargarPlatosDesdeGoogle() {
    try {
        const response = await fetch(SHEET_URL);
        const csv = await response.text();
        
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
    } catch (error) {
        console.error('Error cargando Google Sheets:', error);
        mostrarError('No se pudieron cargar los platos. Verifica tu Google Sheet ID.');
        cargarPlatosLocales();
    }
}

// ============================================
// PLATOS LOCALES (si Google Sheets falla)
// ============================================
function cargarPlatosLocales() {
    platos = {
        arepa: { nombre: 'Arepa', precio: 3.00 },
        empanada: { nombre: 'Empanada', precio: 2.50 },
        tequeño: { nombre: 'Tequeño', precio: 2.00 },
        cachapa: { nombre: 'Cachapa', precio: 4.00 },
        pastel: { nombre: 'Pastel', precio: 1.50 }
    };
    bebidas = {
        chicha: { nombre: 'Chicha de maní', precio: 3.00 },
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
    document.getElementById('bebidaSelect').value = '';
    
    if (!id) {
        platoActual = '';
        precioUnitario = 0;
        tipo_seleccion = '';
        actualizarDisplay();
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
    document.getElementById('platoSelect').value = '';
    
    if (!id) {
        platoActual = '';
        precioUnitario = 0;
        tipo_seleccion = '';
        actualizarDisplay();
        return;
    }
    
    platoActual = id;
    precioUnitario = bebidas[id].precio;
    tipo_seleccion = 'bebida';
    cantidad = 1;
    actualizarDisplay();
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
        const total = (cantidad * precioUnitario).toFixed(2);
        document.getElementById('totalDisplay').textContent = total;
    } else {
        document.getElementById('platoActual').textContent = 'Selecciona un plato o bebida';
    }
}

// Mostrar Total
function mostrarTotal() {
    if (!platoActual) {
        alert('Por favor selecciona un plato o bebida primero');
        return;
    }
    const total = (cantidad * precioUnitario).toFixed(2);
    const nombre_item = tipo_seleccion === 'bebida' ? bebidas[platoActual].nombre : platos[platoActual].nombre;
    alert(`TOTAL: Bs ${total}\n\n${nombre_item}\nCantidad: ${cantidad} x Bs ${precioUnitario.toFixed(2)}`);
}

// Cobrar con efectivo
async function cobrarEfectivo() {
    if (!platoActual) {
        alert('Por favor selecciona un plato o bebida primero');
        return;
    }
    const total = (cantidad * precioUnitario).toFixed(2);
    const nombre_item = tipo_seleccion === 'bebida' ? bebidas[platoActual].nombre : platos[platoActual].nombre;
    alert(`✓ EFECTIVO RECIBIDO\n\n${nombre_item}\nCantidad: ${cantidad}\nTotal: Bs ${total}\n\n¡Gracias por tu compra!`);
    await registrarTransaccion(nombre_item, cantidad, precioUnitario, 'efectivo');
    document.getElementById('platoSelect').value = '';
    document.getElementById('bebidaSelect').value = '';
    platoActual = '';
    cantidad = 1;
    actualizarDisplay();
}

// Cobrar con QR
async function cobrarQR() {
    if (!platoActual) {
        alert('Por favor selecciona un plato o bebida primero');
        return;
    }
    const total = (cantidad * precioUnitario).toFixed(2);
    const nombre_item = tipo_seleccion === 'bebida' ? bebidas[platoActual].nombre : platos[platoActual].nombre;
    alert(`✓ PAGO QR REGISTRADO\n\n${nombre_item}\nCantidad: ${cantidad}\nTotal: Bs ${total}\n\n¡Gracias por tu compra!`);
    await registrarTransaccion(nombre_item, cantidad, precioUnitario, 'qr');
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
    
    // Cargar transacciones del localStorage
    cargarTransacciones();
    
    // Cargar platos desde Google Sheets
    cargarPlatosDesdeGoogle();
});

// Mostrar modal de resumen
function mostrarResumen() {
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
