// tickets-list.js - Listado de tickets para adminIT

document.addEventListener('DOMContentLoaded', async () => {
  // Solo adminIT puede ver la página
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.rol !== 'adminIT') {
    document.body.innerHTML = '<h2 style="color:#dc2626;text-align:center;margin-top:4rem;">Acceso restringido. Solo administradores IT pueden ver los tickets.</h2>';
    return;
  }
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const tableBody = document.querySelector('#ticketsTable tbody');
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al obtener tickets');
    const tickets = await res.json();
    if (!tickets.length) {
      tableBody.innerHTML = '<tr><td colspan="7" style="color:red;">No hay tickets registrados</td></tr>';
      return;
    }
    tableBody.innerHTML = '';
    tickets.forEach(t => {
      tableBody.innerHTML += `
        <tr>
          <td>${t.fecha ? new Date(t.fecha).toLocaleDateString() : ''}</td>
          <td>${t.usuarioNombre || t.usuario || ''}</td>
          <td>${t.tipo}</td>
          <td>${t.prioridad}</td>
          <td>${t.asunto}</td>
          <td class="estado-${t.estado}">${t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}</td>
          <td><button class="ver" onclick="window.location.href='/ticket.html?id=${t._id}'"><i class="fa-solid fa-eye"></i> Ver</button></td>
        </tr>
      `;
    });
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">${err.message}</td></tr>`;
  }
});
