function renderGastos(gastos) {
  const t = document.getElementById("tablaGastos");
  t.innerHTML = "";
  let totalMes = 0;
  const now = new Date();
  const mesActual = now.getMonth();
  const añoActual = now.getFullYear();
  gastos.forEach(g => {
    let fechaGasto = null;
    if (g.fecha) {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(g.fecha)) {
        const [d, m, y] = g.fecha.split('/');
        fechaGasto = new Date(`${y}-${m}-${d}`);
      } else {
        fechaGasto = new Date(g.fecha);
      }
    }
    if (fechaGasto && fechaGasto.getMonth() === mesActual && fechaGasto.getFullYear() === añoActual) {
      totalMes += Number(g.monto) || 0;
    }
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
  document.getElementById('resumenMes').textContent = totalMes.toLocaleString('es-ES', {style:'currency', currency:'EUR'});
}
