// Adjuntar y previsualizar factura
window.adjuntarFactura = function() {
  const input = document.getElementById('facturaInput');
  const preview = document.getElementById('facturaPreview');
  if (!input.files || !input.files[0]) {
    preview.innerHTML = '<span style="color:#dc2626">No se ha seleccionado ningún archivo.</span>';
    return;
  }
  const file = input.files[0];
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Factura" style="max-width:100%;max-height:300px;border-radius:8px;box-shadow:0 2px 8px #0002;">`;
    };
    reader.readAsDataURL(file);
  } else if (file.type === 'application/pdf') {
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<iframe src="${url}" style="width:100%;height:400px;border:none;"></iframe>`;
  } else {
    preview.innerHTML = '<span style="color:#dc2626">Formato no soportado. Solo PDF o imagen.</span>';
  }
};
// Mostrar detalle del gasto
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

function getGastoIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}


async function fetchGasto() {
  const gastoId = getGastoIdFromUrl();
  if (!gastoId) return;
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE_URL}/gastos/${gastoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      document.querySelector('.main').innerHTML += `<div style='color:red;margin-top:2rem;'>No se encontró el gasto o hubo un error (${res.status})</div>`;
      return;
    }
    const gasto = await res.json();
    // Si los datos existen, no mostrar mensaje de error
    if (gasto && Object.keys(gasto).length > 0) {
      // Limpiar posibles mensajes de error previos
      document.querySelectorAll('.main div[style*="color:red"]').forEach(e => e.remove());
      document.getElementById('g_fecha').textContent = gasto.fecha ? new Date(gasto.fecha).toLocaleDateString() : '';
      document.getElementById('g_proveedor').textContent = gasto.proveedorNombre || '';
      document.getElementById('g_numeroFactura').textContent = gasto.numeroFactura || '';
      document.getElementById('g_monto').textContent = gasto.monto;
      document.getElementById('g_categoria').textContent = gasto.categoria || '';
      // Si el gasto tiene una licencia asociada, mostrar los datos de la licencia en la modal
      if (gasto.licenciaId) {
        mostrarLicenciaEnModal(gasto.licenciaId);
      }
    }
  } catch (err) {
    // Solo mostrar el mensaje si no hay datos
    if (!document.getElementById('g_monto').textContent) {
      document.querySelector('.main').innerHTML += `<div style='color:red;margin-top:2rem;'>Error de conexión al obtener el gasto</div>`;
    }
  }
}

fetchGasto();

// Mostrar datos de la licencia en la modal
async function mostrarLicenciaEnModal(licenciaId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/licencias/${licenciaId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return;
  const licencia = await res.json();
  // Generar HTML para mostrar los datos de la licencia
  const html = `
    <div class="card">
      <h3>Licencia asociada</h3>
      <p>ID: <span>${licencia._id}</span></p>
      <p>Software: <span>${licencia.software || ''}</span></p>
      <p>Nombre Licencia: <span>${licencia.nombreLicencia || ''}</span></p>
      <p>Licencia: <span>${licencia.licencia || ''}</span></p>
      <p>Usuario: <span>${licencia.usuario || ''}</span></p>
      <p>Empleado Asignado: <span>${licencia.empleadoAsignado || ''}</span></p>
      <p>Departamento: <span>${licencia.departamento || ''}</span></p>
      <p>Proveedor: <span>${licencia.proveedor || ''}</span></p>
      <p>Expiración: <span>${licencia.expiracion ? licencia.expiracion.slice(0,10) : ''}</span></p>
    </div>
  `;
  // Mostrar en la modal
  document.getElementById('modalFields').innerHTML = html;
  document.getElementById('modalOverlay').style.display = 'flex';
}
