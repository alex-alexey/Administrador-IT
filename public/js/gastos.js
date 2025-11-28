/* LOGOUT */
document.getElementById("btnLogout").onclick = () => {
  localStorage.clear(); sessionStorage.clear();
  window.location.href = "/login.html";
};

/* MODAL */
function openModal(){ document.getElementById("modalOverlay").style.display = "flex"; }
function closeModal(){ document.getElementById("modalOverlay").style.display = "none"; }

/* CARGAR GASTOS */
async function cargarGastos(){
  const token = localStorage.getItem('token');
  console.log('Token usado en GET /api/gastos:', token);
  const res = await fetch("http://localhost:4000/api/gastos", {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const datos = await res.json();

  const t = document.getElementById("tablaGastos");
  t.innerHTML = "";

  datos.forEach(g=>{
    const tr = document.createElement("tr");
    tr.onclick = ()=>window.location.href=`/gasto.html?id=${g._id}`;
    tr.innerHTML = `
      <td>${g.concepto}</td>
      <td>$${g.monto}</td>
      <td>${g.categoria}</td>
      <td>${g.fecha?.slice(0,10)}</td>
    `;
    t.appendChild(tr);
  });
}

/* GUARDAR */
async function guardarGasto(){
  const data = {
    concepto: m_concepto.value,
    monto: m_monto.value,
    categoria: m_categoria.value,
    fecha: m_fecha.value
  };

  const token = localStorage.getItem('token');
  console.log('Token usado en POST /api/gastos:', token);
  await fetch("http://localhost:4000/api/gastos", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${token}`
    },
    body:JSON.stringify(data)
  });

  closeModal();
  cargarGastos();
}

cargarGastos();
