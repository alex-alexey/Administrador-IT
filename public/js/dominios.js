
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

// Referencias DOM
const dominiosTableBody = document.getElementById('dominiosTableBody');
const totalDominios = document.getElementById('totalDominios');
const activosDom = document.getElementById('activosDom');
const expiradosDom = document.getElementById('expiradosDom');

// Renderizar la tabla de dominios
function renderDomTable(dominios) {
  dominiosTableBody.innerHTML = '';
  if (!dominios.length) {
    dominiosTableBody.innerHTML = '<tr><td colspan="6" style="color:red;">No hay dominios registrados</td></tr>';
    totalDominios.textContent = activosDom.textContent = expiradosDom.textContent = '0';
    return;
  }
  let total = 0, act = 0, exp = 0;
  dominios.forEach(dom => {
    let estado = dom.estado || '';
    total++;
    if (estado.toLowerCase() === 'activo') act++;
    if (estado.toLowerCase() === 'expirado') exp++;
    dominiosTableBody.innerHTML += `
      <tr class="dom-row" data-id="${dom._id}" style="cursor:pointer;">
        <td>${dom.nombre || ''}</td>
        <td>${dom.proveedor || ''}</td>
        <td>${dom.estado || ''}</td>
        <td>${dom.fechaCompra || ''}</td>
        <td>${dom.fechaExpiracion || ''}</td>
        <td class="acciones">
          <button class="edit"><i class="fa-solid fa-pen"></i></button>
          <button class="delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
  totalDominios.textContent = total;
  activosDom.textContent = act;
  expiradosDom.textContent = exp;
}

// Obtener dominios de la API
async function fetchDominios() {
  try {
    const token = localStorage.getItem('token');
    console.log('Token usado en GET /api/dominios:', token);
    const res = await fetch(`${API_BASE_URL}/dominios`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al obtener dominios');
    const dominios = await res.json();
    console.log('Respuesta dominios:', dominios);
    renderDomTable(dominios);
  } catch (err) {
    dominiosTableBody.innerHTML = `<tr><td colspan="6" style="color:red;">${err.message}</td></tr>`;
    totalDominios.textContent = activosDom.textContent = expiradosDom.textContent = '0';
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', fetchDominios);

// Modal lógica
const modalDominio = document.getElementById('modalDominio');
const btnAddDominio = document.getElementById('btnAddDominio');
const btnCancelarDominio = document.getElementById('btnCancelarDominio');
const formDominio = document.getElementById('formDominio');
const dominioMsg = document.getElementById('dominioMsg');

btnAddDominio.addEventListener('click', () => {
  formDominio.reset();
  dominioMsg.textContent = '';
  modalDominio.style.display = 'flex';
});
btnCancelarDominio.addEventListener('click', () => {
  modalDominio.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === modalDominio) modalDominio.style.display = 'none';
});

formDominio.addEventListener('submit', async function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formDominio));
  dominioMsg.textContent = '';
  try {
    const token = localStorage.getItem('token');
    console.log('Token usado en POST /api/dominios:', token);
    const res = await fetch(`${API_BASE_URL}/dominios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear el dominio');
    dominioMsg.textContent = 'Dominio añadido correctamente.';
    modalDominio.style.display = 'none';
    fetchDominios();
  } catch (err) {
    dominioMsg.textContent = err.message;
  }
});

// Delegación de evento para hacer toda la fila clicable
dominiosTableBody.addEventListener('click', function(e) {
  let tr = e.target.closest('tr.dom-row');
  if (tr && tr.dataset.id) {
    window.location.href = `/dominio.html?id=${tr.dataset.id}`;
  }
});
