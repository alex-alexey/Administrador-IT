// Configuración de la URL base de la API según el entorno
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

// Verificación universal de login
if (!localStorage.getItem('loggedIn')) {
  window.location.href = '/login.html';
}

// Elementos del DOM
const licenseTableBody = document.getElementById('licenseTableBody');
const totalLicencias = document.getElementById('totalLicencias');
const proximas = document.getElementById('proximas');
const caducadas = document.getElementById('caducadas');
const searchInput = document.getElementById('searchLicInput');
const filterEstado = document.getElementById('filterLicEstado');
const btnLogout = document.getElementById('btnLogout');

// Estado global
let licencias = [];

// -------------------- LOGOUT --------------------
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

// -------------------- FETCH LICENCIAS --------------------
async function fetchLicencias() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/licencias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudo cargar las licencias');
    licencias = await res.json();
    renderTable();
    updateStats();
  } catch (err) {
    licenseTableBody.innerHTML = `<tr><td colspan="7" style="color:red;">${err.message}</td></tr>`;
    totalLicencias.textContent = proximas.textContent = caducadas.textContent = '0';
  }
}

// -------------------- RENDER TABLE --------------------
function renderTable() {
  licenseTableBody.innerHTML = '';
  if (!licencias.length) {
    licenseTableBody.innerHTML = '<tr><td colspan="7" style="color:#9ca3af;text-align:center;padding:2rem;">No hay licencias registradas</td></tr>';
    return;
  }
  licencias.forEach((lic) => {
    const tr = document.createElement('tr');
    tr.dataset.id = lic._id;
    tr.style.cursor = 'pointer';
    // Calcular estado por fecha de expiración
    let estado = 'Sin estado';
    let badgeClass = 'badge';
    if (lic.expiracion) {
      const hoy = new Date();
      const exp = new Date(lic.expiracion);
      const diasRestantes = Math.ceil((exp - hoy) / (1000*60*60*24));
      if (exp >= hoy) {
        if (diasRestantes <= 30) {
          estado = 'Pendiente de renovación';
          badgeClass = 'badge-proxima';
        } else {
          estado = 'Activa';
          badgeClass = 'badge-activa';
        }
      } else {
        estado = 'Caducada';
        badgeClass = 'badge-caducada';
      }
    }
    tr.innerHTML = `
      <td>${lic.software || ''}</td>
      <td>${lic.nombreLicencia || ''}</td>
      <td>${lic.proveedor || ''}</td>
      <td>${lic.empleadoAsignado || ''}</td>
      <td>${lic.expiracion ? lic.expiracion.slice(0, 10) : ''}</td>
      <td><span class="badge ${badgeClass}">${estado}</span></td>
      <td class="acciones">
        <button class="edit" onclick="window.location.href='/licencia/${lic._id}'"><i class="fa-solid fa-pen"></i></button>
        <button class="delete" onclick="deleteLicencia('${lic._id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tr.addEventListener('click', function(e) {
      if (e.target.closest('.acciones')) return;
      window.location.href = `/licencia/${lic._id}`;
    });
    tr.querySelector('.edit').addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = `/licencia/${lic._id}`;
    });
    licenseTableBody.appendChild(tr);
  });
}

// -------------------- UPDATE STATS --------------------
function updateStats() {
  totalLicencias.textContent = licencias.length;
  let prox = 0, cad = 0;
  licencias.forEach(lic => {
    let proxFlag = false, cadFlag = false;
    if (lic.expiracion) {
      const hoy = new Date();
      const exp = new Date(lic.expiracion);
      const diasRestantes = Math.ceil((exp - hoy) / (1000*60*60*24));
      if (exp >= hoy) {
        if (diasRestantes <= 30) proxFlag = true;
      } else {
        cadFlag = true;
      }
    }
    if (proxFlag) prox++;
    if (cadFlag) cad++;
  });
  proximas.textContent = prox;
  caducadas.textContent = cad;
}

// -------------------- DELETE LICENCIA --------------------
async function deleteLicencia(id) {
  if (confirm('¿Estás seguro de eliminar esta licencia?')) {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/licencias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchLicencias();
    } catch {
      alert('Error al eliminar la licencia');
    }
  }
}

// -------------------- FILTRAR TABLA --------------------
function filtrarTabla() {
  const term = (searchInput.value || '').toLowerCase();
  const estado = filterEstado.value.toLowerCase();
  const rows = licenseTableBody.querySelectorAll('tr');
  rows.forEach((tr, i) => {
    const lic = licencias[i];
    if (!lic) return;
    const coincideBusqueda = 
      (lic.software || '').toLowerCase().includes(term) ||
      (lic.empleadoAsignado || '').toLowerCase().includes(term) ||
      (lic.proveedor || '').toLowerCase().includes(term);
    const coincideEstado = !estado || (lic.estado || '').toLowerCase().includes(estado);
    tr.style.display = (coincideBusqueda && coincideEstado) ? '' : 'none';
  });
}

// -------------------- MODAL AÑADIR LICENCIA --------------------
document.getElementById('btnAddLicense').addEventListener('click', () => {
  document.getElementById('modalAddOverlay').style.display = 'flex';
  fetchEmpleadosAddList();
});
function fetchEmpleadosAddList() {
  const token = localStorage.getItem('token');
  fetch(`${API_BASE_URL}/empleados`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(empleados => {
      const select = document.getElementById('add_empleadoAsignado');
      if (!select) return;
      let options = '<option value="">Selecciona empleado...</option>';
      empleados.forEach(emp => {
        options += `<option value="${emp.nombre}">${emp.nombre}</option>`;
      });
      select.innerHTML = options;
    });
}
document.getElementById('btnCancelAdd').addEventListener('click', () => {
  document.getElementById('modalAddOverlay').style.display = 'none';
});

document.getElementById('formAddLicencia').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {};
  Array.from(form.elements).forEach(el => {
    if (el.name) data[el.name] = el.value;
  });
  try {
    const res = await fetch(`${API_BASE_URL}/licencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      document.getElementById('modalAddOverlay').style.display = 'none';
      form.reset();
      fetchLicencias();
    } else {
      alert('Error al guardar la licencia');
    }
  } catch {
    alert('Error de conexión al guardar la licencia');
  }
});

// -------------------- EVENTOS --------------------
if (searchInput) searchInput.addEventListener('input', filtrarTabla);
if (filterEstado) filterEstado.addEventListener('change', filtrarTabla);

// -------------------- INICIALIZACIÓN --------------------
document.addEventListener('DOMContentLoaded', function() {
  setupLogout();
  fetchLicencias();
});