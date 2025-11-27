// Mostrar modal al hacer clic en 'Añadir Dispositivo'
const btnAddDevice = document.getElementById('btnAddDevice');
const deviceModal = document.getElementById('deviceModal');
if (btnAddDevice && deviceModal) {
  btnAddDevice.addEventListener('click', function() {
    deviceModal.style.display = 'flex';
    document.getElementById('deviceForm').reset();
  });

  // Cerrar modal al hacer clic en 'Cancelar'
  const btnCancel = document.getElementById('btnCancel');
  if (btnCancel) {
    btnCancel.addEventListener('click', function() {
      deviceModal.style.display = 'none';
    });
  }

  // Cerrar modal al hacer clic fuera de la tarjeta
  deviceModal.addEventListener('click', function(e) {
    if (e.target === deviceModal) {
      deviceModal.style.display = 'none';
    }
  });
}
// Configuración de la URL base de la API según el entorno
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

// Verificación universal de login
if (!localStorage.getItem('loggedIn')) {
  window.location.href = '/login.html';
}

// Elementos principales del DOM
const tablaBody = document.getElementById('inventoryTableBody');
const totalDevices = document.getElementById('totalDevices');
const operativos = document.getElementById('operativos');
const stock = document.getElementById('stock');
const reparacion = document.getElementById('reparacion');
const baja = document.getElementById('baja');
const btnLogout = document.getElementById('btnLogout');
const searchInput = document.getElementById('searchInput');
const filterTipo = document.getElementById('filterTipo');
const filterEstado = document.getElementById('filterEstado');

// Estado global del inventario
let inventory = [];

// -------------------- FUNCIONES PRINCIPALES --------------------

// Cerrar sesión
function setupLogout() {
  if (btnLogout) {
    btnLogout.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        await fetch(`${API_BASE_URL}/usuarios/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {}
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login.html';
    });
  }
}

// Mostrar popup de error
function mostrarPopupError(mensaje) {
  let popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100vw';
  popup.style.height = '100vh';
  popup.style.background = 'rgba(30,58,138,0.85)';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';
  popup.style.zIndex = '9999';
  popup.innerHTML = `<div style="background:#fff; color:#ef4444; padding:2.5rem 2.5rem; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.12); font-size:1.2rem; font-weight:600; text-align:center; max-width:90vw;">
    <i class='fa-solid fa-triangle-exclamation' style='font-size:2.5rem; color:#ef4444; margin-bottom:1rem;'></i><br>
    ${mensaje}<br><br>
    <button onclick="this.parentElement.parentElement.remove()" style="margin-top:1rem; background:#ef4444; color:#fff; border:none; border-radius:8px; padding:0.7rem 1.5rem; font-size:1rem; cursor:pointer;">Cerrar</button>
  </div>`;
  document.body.appendChild(popup);
}

// Obtener inventario desde la API
async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE_URL}/inventario`);
    if (!res.ok) {
      let errorMsg = 'No se pudo cargar el inventario';
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }
    inventory = await res.json();
    renderTable();
    updateStats();
  } catch (err) {
    tablaBody.innerHTML = `<tr><td colspan="10" style="color:red;">${err.message}</td></tr>`;
    totalDevices.textContent = operativos.textContent = reparacion.textContent = baja.textContent = stock.textContent = '0';
    mostrarPopupError(err.message || 'El servidor no responde. Por favor, inténtalo más tarde.');
  }
}

// Renderizar la tabla de inventario
function renderTable() {
  tablaBody.innerHTML = '';
  inventory.forEach((item) => {
    const tr = document.createElement('tr');
    tr.dataset.id = item._id;
    let estadoColor = '#22c55e'; // Operativo
    const estado = (item.estado || '').toLowerCase();
    if (estado === 'en reparación') estadoColor = '#f59e42';
    if (estado === 'baja') estadoColor = '#ef4444';
    if (estado === 'stock') estadoColor = '#3b82f6';

    // Obtener responsable actual de la última asignación
    let responsable = item.responsable || item.empleado || '';
    if (Array.isArray(item.asignaciones) && item.asignaciones.length > 0) {
      const asignacionesActivas = item.asignaciones.filter(a => !a.fin);
      if (asignacionesActivas.length > 0) {
        responsable = asignacionesActivas[asignacionesActivas.length-1].empleado || responsable;
      } else {
        const ultima = item.asignaciones[item.asignaciones.length-1];
        responsable = ultima.empleado || responsable;
      }
    }

    tr.innerHTML = `
      <td>${item.categoria || item.tipo || ''}</td>
      <td>${item.trazaEquipo || ''}</td>
      <td>${item.modelo || ''}</td>
      <td>${item.marca || ''}</td>
      <td><span style="display:inline-block;padding:0.3em 0.8em;border-radius:12px;font-size:0.95em;font-weight:600;background:${estadoColor};color:#fff;">${item.estado || ''}</span></td>
      <td>${responsable}</td>
      <td class="acciones">
        <a href="#" class="edit" data-id="${item._id}"><i class="fa-solid fa-pen"></i></a>
        <button class="delete" onclick="deleteDevice('${item._id}')"><i class="fa-solid fa-trash"></i></button>
      </td>`;
    tr.style.cursor = 'pointer';

    // Redirección al hacer clic en la fila (excepto acciones)
    tr.addEventListener('click', function(e) {
      if (e.target.closest('.acciones')) return;
  window.location.href = `/ordenador/${item._id}`;
    });

    // Redirección al hacer clic en el icono de editar
    tr.querySelector('.edit').addEventListener('click', function(e) {
      e.preventDefault();
  window.location.href = `/ordenador/${item._id}`;
    });

    tablaBody.appendChild(tr);
  });
}

// Actualizar estadísticas
function updateStats() {
  totalDevices.textContent = inventory.length;
  operativos.textContent = inventory.filter(d=> (d.estado||'').toLowerCase() === 'operativo').length;
  stock.textContent = inventory.filter(d=> (d.estado||'').toLowerCase() === 'stock').length;
  reparacion.textContent = inventory.filter(d=> (d.estado||'').toLowerCase() === 'en reparación').length;
  baja.textContent = inventory.filter(d=> (d.estado||'').toLowerCase() === 'baja').length;
}

// Eliminar dispositivo
async function deleteDevice(id){
  if(confirm('¿Estás seguro de eliminar este dispositivo?')){
    try {
      await fetch(`${API_BASE_URL}/inventario/${id}`, {method:'DELETE'});
      fetchInventory();
    } catch {
      mostrarPopupError('El servidor no responde. No se pudo eliminar el dispositivo.');
    }
  }
}

// Filtrar la tabla por búsqueda y selectores
function filtrarTabla() {
  const term = (searchInput.value || '').toLowerCase();
  const tipo = filterTipo.value;
  const estado = filterEstado.value;
  const rows = tablaBody.querySelectorAll('tr');
  rows.forEach((tr, i) => {
    const device = inventory[i];
    const coincideBusqueda = device.tipo?.toLowerCase().includes(term) || device.modelo?.toLowerCase().includes(term) || (device.empleado||'').toLowerCase().includes(term);
    const coincideTipo = !tipo || device.tipo === tipo || (tipo==='Teclado y ratón' && (device.tipo==='Teclado' || device.tipo==='Ratón')) || (tipo==='Otros' && device.tipo==='Otro');
    const coincideEstado = !estado || (device.estado||'').toLowerCase() === estado.toLowerCase();
    tr.style.display = (coincideBusqueda && coincideTipo && coincideEstado) ? '' : 'none';
  });
}

// -------------------- EVENTOS --------------------

if (searchInput) searchInput.addEventListener('input', filtrarTabla);
if (filterTipo) filterTipo.addEventListener('change', filtrarTabla);
if (filterEstado) filterEstado.addEventListener('change', filtrarTabla);

// -------------------- INICIALIZACIÓN --------------------

document.addEventListener('DOMContentLoaded', function() {
  setupLogout();
  fetchInventory();
});