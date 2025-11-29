// ===================== UTILS =====================
function parseFecha(fecha) {
  if (!fecha) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split('/');
    return new Date(`${y}-${m}-${d}`);
  }
  return new Date(fecha);
}

function calcularTotales(gastos) {
  const añoSeleccionado = Number(document.getElementById('filtroAnio').value);
  const mesSeleccionado = document.getElementById('filtroMes').value;
  const trimestreSeleccionado = document.getElementById('filtroTrimestre')?.value;
  let totalMes = 0, totalTrimestre = 0, totalAño = 0;
  let categoriaCostosa = { nombre: '', total: 0 };
  const categorias = {};
  let debugGastosMes = [];
  console.log('Filtro año:', añoSeleccionado, 'Filtro mes:', mesSeleccionado);
  gastos.forEach(g => {
    const fechaGasto = parseFecha(g.fecha);
    const monto = Number(g.monto) || 0;
    // Total del mes filtrado
    if (mesSeleccionado !== 'todos' && mesSeleccionado !== 'trimestre' && fechaGasto && fechaGasto.getFullYear() === añoSeleccionado && fechaGasto.getMonth() === Number(mesSeleccionado)) {
      totalMes += monto;
      debugGastosMes.push({fecha: g.fecha, monto, fechaGasto});
    }
    // Total del trimestre filtrado
    if (mesSeleccionado === 'trimestre' && fechaGasto && fechaGasto.getFullYear() === añoSeleccionado && Math.floor(fechaGasto.getMonth() / 3) === Number(trimestreSeleccionado)) {
      totalTrimestre += monto;
    }
    // Total del año filtrado
    if (fechaGasto && fechaGasto.getFullYear() === añoSeleccionado) {
      totalAño += monto;
    }
    // Categoría más costosa
    if (g.categoria) {
      categorias[g.categoria] = (categorias[g.categoria] || 0) + monto;
      if (categorias[g.categoria] > categoriaCostosa.total) categoriaCostosa = { nombre: g.categoria, total: categorias[g.categoria] };
    }
  });
  console.log('Gastos que suman al totalMes:', debugGastosMes);
  return { totalMes, totalTrimestre, totalAño, categoriaCostosa };
}

// ===================== RENDER =====================
function renderTablaGastos(gastos) {
  const t = document.getElementById("tablaGastos");
  t.innerHTML = "";
  gastos.forEach(g => {
    const fechaGasto = parseFecha(g.fecha);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.fecha ? fechaGasto.toLocaleDateString() : ''}</td>
      <td>${g.proveedorNombre || g.proveedor || ''}</td>
      <td>${g.numeroFactura || ''}</td>
      <td>${g.monto} €</td>
      <td>${g.categoria}</td>
      <td>
        <button onclick="window.location.href='/gasto.html?id=${g._id}'" class="btn-ver">Ver</button>
        <button onclick="eliminarGasto('${g._id}', event)" class="btn-eliminar"><i class='fa fa-trash'></i></button>
      </td>
    `;
    tr.addEventListener('click', function(e) {
      if (e.target.classList.contains('btn-eliminar')) return;
      mostrarGastoEnModal(g);
    });
    t.appendChild(tr);
  });
}

function renderContadores(totales) {
  const elTotalMes = document.getElementById('resumenMes');
  const elTotalTrimestre = document.getElementById('resumenTrimestre');
  const elTotalAño = document.getElementById('resumenAnual');
  const elCategoriaCostosa = document.getElementById('resumenCategoria');
  const mesSeleccionado = document.getElementById('filtroMes').value;
  if (elTotalMes) {
    elTotalMes.textContent = (mesSeleccionado !== 'trimestre')
      ? totales.totalMes.toLocaleString('es-ES', {style:'currency', currency:'EUR'})
      : '';
  }
  if (elTotalTrimestre) {
    elTotalTrimestre.textContent = (mesSeleccionado === 'trimestre')
      ? totales.totalTrimestre.toLocaleString('es-ES', {style:'currency', currency:'EUR'})
      : '';
  }
  if (elTotalAño) elTotalAño.textContent = totales.totalAño.toLocaleString('es-ES', {style:'currency', currency:'EUR'});
  if (elCategoriaCostosa) elCategoriaCostosa.textContent = totales.categoriaCostosa.nombre
    ? `${totales.categoriaCostosa.nombre} (${totales.categoriaCostosa.total.toLocaleString('es-ES', {style:'currency', currency:'EUR'})})`
    : 'N/A';
}

function renderGastos(gastos) {
  renderTablaGastos(gastos);
  const totales = calcularTotales(gastos);
  renderContadores(totales);
}

// ===================== FILTROS =====================
function filtrarGastos() {
  // ...filtros personalizados si se requieren en el futuro...
  renderGastos(window._gastos || []);
}
// Inicialización
window.addEventListener('DOMContentLoaded', () => {
  inicializarFiltrosFecha();
  cargarGastos();
  document.getElementById('filtroAnio').addEventListener('change', function() {
    const añoSeleccionado = Number(this.value);
    const gastos = window._gastos || [];
    // Buscar el último mes con gastos en ese año
    let mesesConGastos = gastos
      .map(g => {
        let fechaGasto = null;
        if (g.fecha) {
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(g.fecha)) {
            const [d, m, y] = g.fecha.split('/');
            fechaGasto = new Date(`${y}-${m}-${d}`);
          } else {
            fechaGasto = new Date(g.fecha);
          }
        }
        return (fechaGasto && fechaGasto.getFullYear() === añoSeleccionado) ? fechaGasto.getMonth() : null;
      })
      .filter(m => m !== null);
    let ultimoMes = null;
    if (mesesConGastos.length > 0) {
      ultimoMes = Math.max(...mesesConGastos);
    }
    if (añoSeleccionado !== new Date().getFullYear()) {
      document.getElementById('filtroTrimestre').style.display = 'none';
      document.getElementById('filtroMes').value = (ultimoMes !== null) ? ultimoMes : 'todos';
    } else {
      document.getElementById('filtroMes').value = new Date().getMonth();
      document.getElementById('filtroTrimestre').style.display = 'none';
    }
    filtrarGastos();
  });
  document.getElementById('filtroMes').addEventListener('change', function() {
    onMesChange();
    filtrarGastos();
  });
  document.getElementById('filtroTrimestre').addEventListener('change', filtrarGastos);
  document.getElementById('filtroCategoria').addEventListener('change', filtrarGastos);
  btnLogout.onclick = () => {
    localStorage.clear(); sessionStorage.clear();
    window.location.href = "/login.html";
  };
});

function inicializarFiltrosFecha() {
  const filtroAnio = document.getElementById('filtroAnio');
  const filtroMes = document.getElementById('filtroMes');
  const añoActual = new Date().getFullYear();
  const mesActual = new Date().getMonth();
  // Años: desde 2020 hasta el actual
  filtroAnio.innerHTML = '';
  for (let y = añoActual; y >= 2020; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    filtroAnio.appendChild(opt);
  }
  filtroAnio.value = añoActual;
  // Meses
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  filtroMes.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = 'todos';
  optTodos.textContent = 'Todos';
  filtroMes.appendChild(optTodos);
  meses.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m;
    filtroMes.appendChild(opt);
  });
  filtroMes.value = mesActual;
}

function onMesChange() {
  const mes = document.getElementById('filtroMes').value;
  const filtroTrimestre = document.getElementById('filtroTrimestre');
  if (mes === 'trimestre') {
    filtroTrimestre.style.display = '';
  } else {
    filtroTrimestre.style.display = 'none';
  }
}

// MODAL
async function openModal(){
  document.getElementById("modalOverlay").style.display = "flex";
  await cargarProveedores();
  document.getElementById('m_proveedor').addEventListener('change', function() {
    const nuevo = document.getElementById('m_proveedor_nuevo');
    if (this.value === '__nuevo__') {
      nuevo.style.display = '';
      nuevo.value = '';
    } else {
      nuevo.style.display = 'none';
    }
  });
  await cargarEmpleados();
  await cargarEmpleadosSolicitante();
  await cargarDepartamentos();
  await cargarProyectos();
// Cargar empleados en el select de Empleado solicitante
async function cargarEmpleadosSolicitante(){
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const res = await fetch(`${API_BASE_URL}/empleados`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const empleados = await res.json();
  const select = document.getElementById('m_usuarioSolicitante');
  select.innerHTML = empleados.map(e => `<option value="${e._id}">${e.nombre}</option>`).join('');
}
  document.getElementById('m_proyecto').addEventListener('change', function() {
    const nuevo = document.getElementById('m_proyecto_nuevo');
    if (this.value === '__nuevo__') {
      nuevo.style.display = '';
      nuevo.value = '';
    } else {
      nuevo.style.display = 'none';
    }
  });
// Cargar proyectos en el select
async function cargarProyectos(){
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  let proyectos = [];
  try {
    const res = await fetch(`${API_BASE_URL}/proyectos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    proyectos = await res.json();
  } catch {}
  const select = document.getElementById('m_proyecto');
  let options = '<option value="">-- Selecciona proyecto --</option>';
  proyectos.forEach(p => {
    options += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
  options += '<option value="__nuevo__">Añadir nuevo proyecto...</option>';
  select.innerHTML = options;
}
// Cargar departamentos en el select
async function cargarDepartamentos(){
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const res = await fetch(`${API_BASE_URL}/departamentos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const departamentos = await res.json();
  const select = document.getElementById('m_departamento');
  select.innerHTML = departamentos.map(d => `<option value="${d.nombre}">${d.nombre}</option>`).join('');
}
// Cargar empleados en el select
async function cargarEmpleados(){
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const res = await fetch(`${API_BASE_URL}/empleados`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const empleados = await res.json();
  const select = document.getElementById('m_empleadoResponsable');
  select.innerHTML = empleados.map(e => `<option value="${e._id}">${e.nombre}</option>`).join('');
}
}

// Cargar proveedores en el select
async function cargarProveedores(){
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const res = await fetch(`${API_BASE_URL}/proveedores`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const proveedores = await res.json();
  const select = document.getElementById('m_proveedor');
  select.innerHTML = proveedores.map(p => `<option value="${p._id}">${p.nombre}</option>`).join('');
}
function closeModal(){ document.getElementById("modalOverlay").style.display = "none"; }

// CARGAR GASTOS
async function cargarGastos(){
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const res = await fetch(`${API_BASE_URL}/gastos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const datos = await res.json();
  window._gastos = datos;
  filtrarGastos();
}

// GUARDAR GASTO
async function guardarGasto(){
  let proyecto = m_proyecto.value;
  if (proyecto === '__nuevo__') {
    proyecto = m_proyecto_nuevo.value;
  }
  let proveedor = m_proveedor.value;
  const monto = Number(m_monto.value);
  const fecha = m_fecha.value;
  if (proveedor === '__nuevo__') {
    const nombreProveedor = m_proveedor_nuevo.value.trim();
    if (!nombreProveedor) {
      alert('Debes indicar el nombre del nuevo proveedor.');
      return;
    }
    // Crear proveedor en backend
    const token = localStorage.getItem('token');
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:4000/api'
      : 'https://it-xqhv.onrender.com/api';
    const resProv = await fetch(`${API_BASE_URL}/proveedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre: nombreProveedor })
    });
    if (!resProv.ok) {
      const error = await resProv.json();
      alert('Error al crear proveedor: ' + (error.error || resProv.status));
      return;
    }
    const nuevoProveedor = await resProv.json();
    proveedor = nuevoProveedor._id;
    await cargarProveedores();
    m_proveedor.value = proveedor;
  }
  if (!proveedor || !monto || !fecha) {
    alert('Proveedor, importe y fecha son obligatorios.');
    return;
  }
  const data = {
    proveedor,
    monto,
    categoria: m_categoria.value,
    fecha,
    numeroFactura: m_numeroFactura.value,
    usuarioSolicitante: m_usuarioSolicitante.value,
    empleadoResponsable: m_empleadoResponsable.value,
    departamento: m_departamento.value,
    proyecto,
    estadoAprobacion: m_estadoAprobacion.value,
    fechaExpiracion: m_fechaExpiracion.value,
    estadoRenovacion: m_estadoRenovacion.value,
    periodicidad: m_periodicidad.value,
    importeRenovacion: m_importeRenovacion.value,
    notasRenovacion: m_notasRenovacion.value
  };
  const token = localStorage.getItem('token');
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const res = await fetch(`${API_BASE_URL}/gastos`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${token}`
    },
    body:JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    alert('Error al registrar gasto: ' + (error.error || res.status));
    return;
  }
  closeModal();
  cargarGastos();
}

// ELIMINAR GASTO
async function eliminarGasto(id, event){
  event.stopPropagation();
  if(confirm('¿Eliminar este gasto?')){
    const token = localStorage.getItem('token');
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:4000/api'
      : 'https://it-xqhv.onrender.com/api';
    await fetch(`${API_BASE_URL}/gastos/${id}`, {
      method:'DELETE',
      headers:{ 'Authorization': `Bearer ${token}` }
    });
    cargarGastos();
  }
}

// FILTRAR GASTOS (placeholder, implementar según lógica)
function filtrarGastos() {
  const año = Number(document.getElementById('filtroAnio').value);
  const mes = document.getElementById('filtroMes').value;
  const categoria = document.getElementById('filtroCategoria').value;
  let trimestre = null;
  if (mes === 'trimestre') {
    trimestre = Number(document.getElementById('filtroTrimestre').value);
  }
  const gastosFiltrados = (window._gastos || []).filter(g => {
    let f = null;
    if (g.fecha) {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(g.fecha)) {
        const [d, m, y] = g.fecha.split('/');
        f = new Date(`${y}-${m}-${d}`);
      } else {
        f = new Date(g.fecha);
      }
    }
    if (mes === 'todos') {
      return f && f.getFullYear() === año;
    } else if (mes === 'trimestre') {
      return f && f.getFullYear() === año && Math.floor(f.getMonth() / 3) === trimestre;
    } else {
      return f && f.getFullYear() === año && f.getMonth() === Number(mes);
    }
  });
  let filtro = { año, mes, trimestre, categoria };
  if (categoria && categoria !== 'todos') {
    filtro.categoria = categoria;
  }
  renderGastos(gastosFiltrados, filtro);
}


// Inicialización
cargarGastos();
