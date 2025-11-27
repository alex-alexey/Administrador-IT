/* LOGOUT */
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login.html";
});

/* Get ID */
function getLicenciaIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}
const licenciaId = getLicenciaIdFromUrl();
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
    console.log('Request:', url);
    const res = await fetch(url);
    console.log('Response status:', res.status);
    if (!res.ok) throw new Error('No se pudo obtener la licencia');
    licenciaData = await res.json();
    console.log('Response data:', licenciaData);
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

  updateEstado(diasRestantes);
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

function openModal() {
  const fields = Object.keys(licenciaData).map(key => {
    return `
      <label>${key}:
        <input type="text" id="modal_${key}" value="${licenciaData[key] || ""}">
      </label>
    `;
  }).join("");
  document.getElementById("modalFields").innerHTML = fields;
  document.getElementById("modalOverlay").style.display = "flex";
}
function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

async function saveModal() {
  const updated = {};
  Object.keys(licenciaData).forEach(key => {
    updated[key] = document.getElementById("modal_" + key)?.value;
  });
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const url = `${API_BASE_URL}/licencias/${licenciaId}`;
  console.log('PUT Request:', url, updated);
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  });
  console.log('PUT Response status:', res.status);
  closeModal();
  fetchLicencia();
}

fetchLicencia();