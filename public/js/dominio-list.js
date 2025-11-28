
// Lógica de entorno para API_BASE_URL
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

// Obtener ID de la URL
function getDominioIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchDominio() {
  const dominioId = getDominioIdFromUrl();
  if (!dominioId) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/dominios/${dominioId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      let errorMsg = `Error ${res.status}: No se pudo cargar el dominio`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.error ? `${errorMsg}\n${errorData.error}` : errorMsg;
      } catch {}
      alert(errorMsg);
      return;
    }
    const dominioData = await res.json();
    renderDominioData(dominioData);
  } catch (err) {
    alert('Error de conexión: ' + err.message);
  }
}

function renderDominioData(dominio) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };
  set('dominioId', dominio._id || '');
  set('dominioNombre', dominio.nombre || '');
  set('dominioProveedor', dominio.proveedor || '');
  set('dominioEstado', dominio.estado || '');
  set('dominioFechaCompra', dominio.fechaCompra ? new Date(dominio.fechaCompra).toLocaleDateString() : '');
  set('dominioFechaExpiracion', dominio.fechaExpiracion ? new Date(dominio.fechaExpiracion).toLocaleDateString() : '');
}

// Inicializar
fetchDominio();
