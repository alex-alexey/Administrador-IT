// Abrir modal de añadir licencia
document.getElementById('btnAddLicense').addEventListener('click', () => {
  document.getElementById('modalAddOverlay').style.display = 'flex';
});

// Cerrar modal de añadir licencia
document.getElementById('btnCancelAdd').addEventListener('click', () => {
  document.getElementById('modalAddOverlay').style.display = 'none';
});

// Guardar nueva licencia
document.getElementById('formAddLicencia').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {};
  Array.from(form.elements).forEach(el => {
    if (el.name) data[el.name] = el.value;
  });
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://it-xqhv.onrender.com/api';
  const res = await fetch(`${API_BASE_URL}/licencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    document.getElementById('modalAddOverlay').style.display = 'none';
    fetchLicencias();
  } else {
    alert('Error al guardar la licencia');
  }
});
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"
  : "https://it-xqhv.onrender.com/api";

const licenseTableBody = document.getElementById("licenseTableBody");
const totalLicencias = document.getElementById("totalLicencias");
const proximas = document.getElementById("proximas");
const caducadas = document.getElementById("caducadas");

function renderLicTable(data) {
  licenseTableBody.innerHTML = "";

  if (!data.length) {
    licenseTableBody.innerHTML =
      '<tr><td colspan="7" style="color:red;">No hay licencias registradas</td></tr>';
    return;
  }

  let total = 0, prox = 0, cad = 0;

  data.forEach(lic => {
    total++;

    const estado = lic.estado?.toLowerCase() || "";
    let badgeClass = "";

    if (estado === "activa") badgeClass = "badge-activa";
    if (estado.includes("próxima")) { badgeClass = "badge-proxima"; prox++; }
    if (estado === "caducada") { badgeClass = "badge-caducada"; cad++; }

    licenseTableBody.innerHTML += `
      <tr class="lic-row" data-id="${lic._id}">
        <td>${lic.software || ""}</td>
        <td>${lic.nombreLicencia || ""}</td>
        <td>${lic.proveedor || ""}</td>
        <td>${lic.usuario || ""}</td>
        <td>${lic.expiracion?.slice(0, 10) || ""}</td>
        <td><span class="badge ${badgeClass}">${lic.estado}</span></td>
        <td class="acciones">
          <button class="edit"><i class="fa-solid fa-pen"></i></button>
          <button class="delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`;
  });

  totalLicencias.innerText = total;
  proximas.innerText = prox;
  caducadas.innerText = cad;

  // Añadir evento para navegar al detalle de licencia
  document.querySelectorAll('.lic-row').forEach(row => {
    row.addEventListener('click', function(e) {
      if (e.target.closest('button')) return;
      const id = this.getAttribute('data-id');
      console.log('Redirigiendo a licencia.html con id:', id);
  window.location.href = '/licencia.html?id=' + id;
    });
  });
}

async function fetchLicencias() {
  try {
    const res = await fetch(`${API_BASE_URL}/licencias`);
    const data = await res.json();
    renderLicTable(data);
  } catch (err) {
    licenseTableBody.innerHTML =
      "<tr><td colspan='7' style='color:red;'>Error al cargar licencias</td></tr>";
  }
}

document.addEventListener("DOMContentLoaded", fetchLicencias);
