/* LOGOUT */
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login.html";
});

/* Get ID */
function getLicenciaIdFromPath() {
  // Extrae el ID de la ruta /licencia/ID
  const match = window.location.pathname.match(/\/licencia\/(\w+)/);
  return match ? match[1] : null;
}
const licenciaId = getLicenciaIdFromPath();
let licenciaData = {};

async function fetchLicencia() {
  if (!licenciaId || licenciaId === 'null') {
    document.querySelector('.main').innerHTML += '<div style="color:red;margin-top:2rem;">No se ha seleccionado ninguna licencia válida.</div>';
    return;
  }
  try {
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:4000/api'
      : 'https://it-xqhv.onrender.com/api';
    const url = `${API_BASE_URL}/licencias/${licenciaId}`;
    const token = localStorage.getItem('token');
    console.log('Token usado en GET /api/licencias/:id:', token);
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  if (!res.ok) throw new Error('No se pudo obtener la licencia');
  licenciaData = await res.json();
    renderLicencia();
  } catch (err) {
    document.querySelector('.main').innerHTML += `<div style="color:red;margin-top:2rem;">Error al cargar la licencia: ${err.message}</div>`;
  }
}

function renderLicencia() {
  const set = (id, val) => document.getElementById(id).innerText = val || "—";

  set("lic_id", licenciaData._id);
  set("lic_software", licenciaData.software);
  set("lic_nombreLicencia", licenciaData.nombreLicencia);
  set("lic_licencia", licenciaData.licencia);
  set("lic_usuario", licenciaData.usuario);
  set("lic_empleadoAsignado", licenciaData.empleadoAsignado);
  set("lic_departamento", licenciaData.departamento);
  set("lic_proveedor", licenciaData.proveedor);
  set("lic_fechaAdquisicion", licenciaData.fechaAdquisicion?.slice(0,10));
  set("lic_fechaUltimaRenovacion", licenciaData.fechaUltimaRenovacion?.slice(0,10));
  set("lic_fechaRenovacion", licenciaData.fechaRenovacion?.slice(0,10));
  set("lic_expiracion", licenciaData.expiracion?.slice(0,10));

  const diasRestantes = calcularDiasRestantes(licenciaData.expiracion);
  document.getElementById("lic_tiempoRestanteRenovacion").innerText = diasRestantes + " días";

  // Calcular estado por fecha de expiración
  const estadoEl = document.getElementById("lic_estado");
  let estado = "Sin estado";
  let badgeClass = "badge";
  if (licenciaData.expiracion) {
    const hoy = new Date();
    const exp = new Date(licenciaData.expiracion);
    const diasRestantes = Math.ceil((exp - hoy) / (1000*60*60*24));
    if (exp >= hoy) {
      if (diasRestantes <= 30) {
        estado = "Pendiente de renovación";
        badgeClass = "badge warning";
      } else {
        estado = "Activa";
        badgeClass = "badge success";
      }
    } else {
      estado = "Caducada";
      badgeClass = "badge danger";
    }
  }
  estadoEl.textContent = estado;
  estadoEl.className = badgeClass;
}

function updateEstado(dias) {
  const el = document.getElementById("lic_estado");
  if (dias > 60) {
    el.textContent = "Activa";
    el.className = "badge success";
  } else if (dias > 0) {
    el.textContent = "Próxima a vencer";
    el.className = "badge warning";
  } else {
    el.textContent = "Expirada";
    el.className = "badge danger";
  }
}

function calcularDiasRestantes(exp) {
  if (!exp) return 0;
  const expDate = new Date(exp);
  const today = new Date();
  return Math.ceil((expDate - today) / (1000*60*60*24));
}

window.openModal = function openModal() {
  // Generar los campos editables en la modal
  document.getElementById("modalFields").innerHTML = `
    <label>Software:<input type="text" id="modal_software" value="${licenciaData.software || ''}"></label>
    <label>Nombre Licencia:<input type="text" id="modal_nombreLicencia" value="${licenciaData.nombreLicencia || ''}"></label>
    <label>Licencia:<input type="text" id="modal_licencia" value="${licenciaData.licencia || ''}"></label>
    <label>Empleado Asignado:<select id="modal_empleadoAsignado"></select></label>
    <label>Departamento:<input type="text" id="modal_departamento" value="${licenciaData.departamento || ''}"></label>
    <label>Proveedor:<input type="text" id="modal_proveedor" value="${licenciaData.proveedor || ''}"></label>
    <label>Expiración:<input type="date" id="modal_expiracion" value="${licenciaData.expiracion ? licenciaData.expiracion.slice(0,10) : ''}"></label>
    <label>Fecha Adquisición:<input type="date" id="modal_fechaAdquisicion" value="${licenciaData.fechaAdquisicion ? licenciaData.fechaAdquisicion.slice(0,10) : ''}"></label>
    <label>Fecha Última Renovación:<input type="date" id="modal_fechaUltimaRenovacion" value="${licenciaData.fechaUltimaRenovacion ? licenciaData.fechaUltimaRenovacion.slice(0,10) : ''}"></label>
    <label>Fecha Renovación:<input type="date" id="modal_fechaRenovacion" value="${licenciaData.fechaRenovacion ? licenciaData.fechaRenovacion.slice(0,10) : ''}"></label>
  `;
  // Cargar lista de empleados en el select
  fetchEmpleadosList(licenciaData.empleadoAsignado);
  document.getElementById("modalOverlay").style.display = "flex";
}

function fetchEmpleadosList(selected) {
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const token = localStorage.getItem('token');
  console.log('Token usado en GET /api/empleados:', token);
  fetch(`${API_BASE_URL}/empleados`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(empleados => {
      const select = document.getElementById('modal_empleadoAsignado');
      select.innerHTML = '<option value="">Selecciona empleado...</option>' +
        empleados.map(emp => `<option value="${emp.nombre}"${emp.nombre === selected ? ' selected' : ''}>${emp.nombre}</option>`).join('');
    });
}
function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

async function saveModal() {
  const updated = {
    software: document.getElementById('modal_software').value,
    nombreLicencia: document.getElementById('modal_nombreLicencia').value,
    licencia: document.getElementById('modal_licencia').value,
    empleadoAsignado: document.getElementById('modal_empleadoAsignado').value,
    departamento: document.getElementById('modal_departamento').value,
    proveedor: document.getElementById('modal_proveedor').value,
    expiracion: document.getElementById('modal_expiracion').value,
    fechaAdquisicion: document.getElementById('modal_fechaAdquisicion').value,
    fechaUltimaRenovacion: document.getElementById('modal_fechaUltimaRenovacion').value,
    fechaRenovacion: document.getElementById('modal_fechaRenovacion').value
  };
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const url = `${API_BASE_URL}/licencias/${licenciaId}`;
  const token = localStorage.getItem('token');
  console.log('Token usado en PUT /api/licencias/:id:', token);
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updated)
  });
  //
  closeModal();
  fetchLicencia();
}

fetchLicencia();