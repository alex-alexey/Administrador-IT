// Protección y visibilidad por rol
const user = JSON.parse(localStorage.getItem('user') || 'null');
requireAuth(['adminIT', 'tecnico', 'manager', 'rrhh', 'empleado', 'admin']);

// Ocultar menús según rol
document.addEventListener('DOMContentLoaded', () => {
  if (!user) return;
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    if (user.rol === 'adminIT') return; // adminIT ve todo
    if (link.href.includes('inventario.html') && !['adminIT','tecnico'].includes(user.rol)) link.style.display = 'none';
    if (link.href.includes('empleados.html') && !['adminIT','rrhh'].includes(user.rol)) link.style.display = 'none';
    if (link.href.includes('licencias.html') && !['adminIT','rrhh'].includes(user.rol)) link.style.display = 'none';
    if (link.href.includes('usuarios.html') && user.rol !== 'adminIT') link.style.display = 'none';
    if (user.rol === 'manager' && !(link.href.includes('dashboard.html') || link.href.includes('controlgastos.html') || link.href.includes('licencias.html'))) link.style.display = 'none';
    if (user.rol === 'empleado' && !(link.href.includes('dashboard.html') || link.href.includes('helpdesk'))) link.style.display = 'none';
  });
});

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

// Renderización del Dashboard y gráficos con datos reales
async function cargarDashboard() {
  try {
    const token = localStorage.getItem('token');
    // Dashboard resumen
    const resDash = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dash = await resDash.json();
    document.getElementById('usuarios').textContent = dash.usuariosRegistrados || 0;
    document.getElementById('dispositivos').textContent = dash.dispositivosIT || 0;
    // Licencias activas: contar desde /licencias
    const resLic = await fetch(`${API_BASE_URL}/licencias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const licencias = await resLic.json();
    // Estado de licencias por campo 'estado', filtrando solo los relevantes
    const estadosRelevantes = ['activa', 'Activa', 'caducada', 'Caducada', 'pendiente', 'Pendiente'];
    const estadoLicencias = { 'Otros': 0 };
    licencias.forEach(l => {
      const estado = (l.estado || 'Sin estado').trim();
      if (estadosRelevantes.includes(estado)) {
        estadoLicencias[estado] = (estadoLicencias[estado] || 0) + 1;
      } else {
        estadoLicencias['Otros'] = (estadoLicencias['Otros'] || 0) + 1;
      }
    });
  // Mostrar total de licencias activas (estado 'activa' o 'Activa')
  const totalActivas = (estadoLicencias['activa'] || 0) + (estadoLicencias['Activa'] || 0);
  document.getElementById('licencias').textContent = totalActivas;

    // Inventario por categoría
    const resInv = await fetch(`${API_BASE_URL}/inventario`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const inventario = await resInv.json();
    // Agrupar por categoría
    const categorias = {};
    inventario.forEach(item => {
      const cat = item.categoria || 'Sin categoría';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });

    // Tickets abiertos (si tienes endpoint, aquí puedes añadirlo)
    document.getElementById('tickets').textContent = dash.ticketsAbiertos || 0;

    // Gráfico de licencias por estado real
    const ctxLic = document.getElementById('chartLicencias');
    const estados = Object.keys(estadoLicencias);
    // Colores por estado, normalizados a minúsculas
    const colorPorEstado = {
      'activa': '#10b981',
      'caducada': '#ef4444',
      'pendiente': '#f59e0b',
      'otros': '#9ca3af'
    };
    new Chart(ctxLic, {
      type: 'doughnut',
      data: {
        labels: estados,
        datasets: [{
          data: estados.map(e => estadoLicencias[e]),
          backgroundColor: estados.map(e => colorPorEstado[e.toLowerCase()] || '#6366f1'),
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        cutout: '70%',
        animation: { duration: 1000, easing: 'easeOutQuart' }
      }
    });

    // Gráfico de inventario por categoría
    const ctxInv = document.getElementById('chartInventario');
    new Chart(ctxInv, {
      type: 'bar',
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          label: 'Cantidad',
          data: Object.values(categorias),
          backgroundColor: Object.keys(categorias).map((_,i) => i%2==0 ? '#3b82f6' : '#6366f1'),
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        },
        animation: { duration: 1000, easing: 'easeOutQuart' }
      }
    });
  } catch (e) {
    console.error("Error al cargar datos:", e);
  }
}

// 🔹 Render de Tickets Abiertos
async function cargarTickets() {
  const contenedor = document.getElementById('ticketsHelpdesk');
  contenedor.innerHTML = '<div class="ticket-loading">Cargando tickets...</div>';
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tickets = await res.json();

    const abiertos = tickets.filter(t => t.estado === 'abierto');
    if (abiertos.length === 0) {
    contenedor.innerHTML = '<div class="ticket-loading">No hay tickets abiertos actualmente.</div>';
      return;
    }

    contenedor.innerHTML = abiertos.slice(0, 5).map(t => `
      <div class="ticket-item">
        <div class="ticket-info">
          <strong>${t.titulo}</strong>
          <small>${t.solicitante} • ${new Date(t.fecha).toLocaleDateString()}</small>
        </div>
        <span class="ticket-priority ${t.prioridad.toLowerCase()}">${t.prioridad}</span>
      </div>
    `).join('');
  } catch (e) {
  contenedor.innerHTML = '<div class="ticket-error">Error al cargar tickets.</div>';
  }
}

cargarDashboard();
cargarTickets();
