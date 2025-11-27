// Funciones JS para ordenador.html

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

let currentRepairRow = null;
let modalType = '';
let deviceId = null;
let deviceData = {};

// Verificación universal de login
if (!localStorage.getItem('loggedIn')) {
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', function() {
  // Logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        await fetch(`${API_BASE_URL}/usuarios/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {}
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login.html';
    });
  }
  fetchDevice();
});

// --- Funciones migradas desde ordenador.html ---


function getDeviceIdFromPath() {
  const match = window.location.pathname.match(/\/ordenador\/(\w+)/);
  return match ? match[1] : null;
}

async function fetchDevice() {
    try {
  deviceId = getDeviceIdFromPath();
      if (!deviceId) {
        document.querySelector('.container').innerHTML = `<div style='color:#ef4444;font-size:1.2em;padding:2em;text-align:center;'>No se ha especificado ningún dispositivo.<br>Vuelve al <a href='/inventario.html'>Inventario</a>.</div>`;
        return;
      }
      const res = await fetch(`${API_BASE_URL}/ordenador/${deviceId}`);
      if (!res.ok) throw new Error('No se pudo cargar el dispositivo');
      deviceData = await res.json();
      renderDeviceData();
    } catch {
      alert('No se pudo cargar el dispositivo');
    }
}

function renderDeviceData() {
  const trazaEl = document.getElementById('traza');
    if (trazaEl) trazaEl.innerText = deviceData.trazaEquipo || '';
  document.getElementById('tipo').innerText = (deviceData.tipo !== undefined && deviceData.tipo !== null && deviceData.tipo !== '') ? deviceData.tipo : 'Sin tipo';
  document.getElementById('categoria').innerText = deviceData.categoria || '';
  document.getElementById('modelo').innerText = deviceData.modelo || '';
  document.getElementById('marca').innerText = deviceData.marca || '';
  document.getElementById('serie').innerText = deviceData.serie || '';
  document.getElementById('estado').innerText = deviceData.estado || '';
  // Badge visual para estado
  const estadoBadge = document.getElementById('estadoBadge');
  let badgeStyle = 'display:inline-flex;align-items:center;gap:0.5em;padding:0.5em 1.2em;border-radius:2em;font-weight:600;font-size:1.05em;box-shadow:0 2px 8px rgba(0,0,0,0.07);letter-spacing:0.5px;cursor:pointer;transition:box-shadow 0.2s;';
  let badgeHtml = '';
  if (deviceData.estado && (deviceData.estado.toLowerCase() === 'operativo' || deviceData.estado.toLowerCase() === 'activo')) {
    badgeHtml = `<span style="${badgeStyle}background:linear-gradient(90deg,#22c55e 70%,#16a34a 100%);color:#fff;" onclick="abrirModalEstado()"><i class='fa-solid fa-circle-check' style='color:#fff;'></i> ${(deviceData.estado.charAt(0).toUpperCase() + deviceData.estado.slice(1))}</span>`;
  } else if (deviceData.estado && deviceData.estado.toLowerCase() === 'baja') {
    badgeHtml = `<span style="${badgeStyle}background:linear-gradient(90deg,#ef4444 70%,#b91c1c 100%);color:#fff;" onclick="abrirModalEstado()"><i class='fa-solid fa-circle-xmark' style='color:#fff;'></i> De baja</span>`;
  } else if (deviceData.estado && deviceData.estado.toLowerCase() === 'stock') {
    badgeHtml = `<span style="${badgeStyle}background:linear-gradient(90deg,#3b82f6 70%,#1e3a8a 100%);color:#fff;" onclick="abrirModalEstado()"><i class='fa-solid fa-box' style='color:#fff;'></i> Stock</span>`;
  } else {
    badgeHtml = `<span style="${badgeStyle}background:linear-gradient(90deg,#9ca3af 70%,#6b7280 100%);color:#fff;" onclick="abrirModalEstado()"><i class='fa-solid fa-circle-question' style='color:#fff;'></i> ${(deviceData.estado || 'Desconocido')}</span>`;
  }
  estadoBadge.innerHTML = badgeHtml;

  // Funciones para modal de estado
  window.abrirModalEstado = function() {
    document.getElementById('modalEstadoOverlay').style.display = 'flex';
    document.getElementById('selectNuevoEstado').value = deviceData.estado ? deviceData.estado.toLowerCase() : 'operativo';
  }
  window.cerrarModalEstado = function() {
    document.getElementById('modalEstadoOverlay').style.display = 'none';
  }
  window.guardarNuevoEstado = async function() {
    const nuevoEstado = document.getElementById('selectNuevoEstado').value;
    try {
      await fetch(`${API_BASE_URL}/ordenador/${deviceId}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ estado: nuevoEstado })
      });
      // Actualiza solo el estado en el DOM sin recargar toda la página
      deviceData.estado = nuevoEstado;
      renderDeviceData();
      cerrarModalEstado();
    } catch { mostrarPopupError('No se pudo actualizar el estado.'); }
  }
  document.getElementById('ubicacion').innerText = deviceData.ubicacion || '';
  document.getElementById('fechaCompra').innerText = deviceData.fechaCompra ? deviceData.fechaCompra.slice(0,10) : '';
  document.getElementById('empleadoActual').innerText = deviceData.responsable || deviceData.empleado || '';
  document.getElementById('observaciones').innerText = deviceData.observaciones || '';
  document.getElementById('cpu').innerText = deviceData.cpu || '';
  document.getElementById('ram').innerText = deviceData.ram || '';
  document.getElementById('storage').innerText = deviceData.storage || '';
  document.getElementById('os').innerText = deviceData.os || '';
  renderAssignments();
  renderRepairs();
}

function renderAssignments() {
  const table = document.getElementById('assignmentsTable');
  table.innerHTML = '';
  (deviceData.asignaciones || []).forEach((asg, idx) => {
    const equipo = deviceData.trazaEquipo || '';
    const inicio = asg.inicio ? asg.inicio.slice(0,10) : '';
    const fin = asg.fin ? asg.fin.slice(0,10) : 'Presente';
    const row = table.insertRow();
    row.innerHTML = `
      <td>${equipo}</td>
      <td>${asg.empleado}</td>
      <td>${asg.departamento}</td>
      <td>${inicio}</td>
      <td>${fin}</td>
      <td>
        <button class="asignaciones-btn edit" onclick="editAssignment(this, ${idx})">Editar</button>
        <button class="asignaciones-btn delete" onclick="deleteAssignment(${idx})">Eliminar</button>
      </td>
    `;
  });
}

function editAssignment(btn, idx) {
  const asg = deviceData.asignaciones[idx];
  openEditModal('assignment');
  setTimeout(() => {
    document.getElementById('modal_empleado').value = asg.empleado;
    document.getElementById('modal_depto').value = asg.departamento;
    document.getElementById('modal_start').value = asg.inicio ? asg.inicio.slice(0,10) : '';
    document.getElementById('modal_end').value = asg.fin ? asg.fin.slice(0,10) : '';
    document.getElementById('modalFields').setAttribute('data-edit-assignment', idx);
  }, 300);
}

async function deleteAssignment(idx) {
  if (!deviceId) return;
  await mostrarPopupConfirmacion('¿Seguro que quieres eliminar este historial?', async () => {
    let asignaciones = deviceData.asignaciones || [];
    asignaciones.splice(idx, 1);
  await fetch(`${API_BASE_URL}/ordenador/${deviceId}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({asignaciones})
    });
    await fetchDevice();
  });
}

function mostrarPopupConfirmacion(mensaje, onConfirm, opciones = {}) {
  return new Promise((resolve) => {
    let popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = 'rgba(30,58,138,0.85)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
  popup.style.zIndex = '11000';
    const confirmText = opciones.confirmText || 'Eliminar';
    const cancelText = opciones.cancelText || 'Cancelar';
    const iconColor = opciones.iconColor || '#ef4444';
    popup.innerHTML = `<div style="background:#fff; color:#1e3a8a; padding:2.5rem 2.5rem; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.12); font-size:1.2rem; font-weight:600; text-align:center; max-width:90vw;">
      <i class='fa-solid fa-triangle-exclamation' style='font-size:2.5rem; color:${iconColor}; margin-bottom:1rem;'></i><br>
      ${mensaje}<br><br>
      <button id="popupConfirmBtn" style="margin-top:1rem; background:${iconColor}; color:#fff; border:none; border-radius:8px; padding:0.7rem 1.5rem; font-size:1rem; cursor:pointer; margin-right:1rem;">${confirmText}</button>
      <button id="popupCancelBtn" style="margin-top:1rem; background:#9ca3af; color:#fff; border:none; border-radius:8px; padding:0.7rem 1.5rem; font-size:1rem; cursor:pointer;">${cancelText}</button>
    </div>`;
    document.body.appendChild(popup);
    document.getElementById('popupConfirmBtn').onclick = async () => {
      document.body.removeChild(popup);
      if (onConfirm) await onConfirm();
      resolve(true);
    };
    document.getElementById('popupCancelBtn').onclick = () => {
      document.body.removeChild(popup);
      resolve(false);
    };
  });
}

function renderRepairs() {
  const table = document.getElementById('repairsTable');
  table.innerHTML = '';
  (deviceData.reparaciones || []).forEach((rep, idx) => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${rep.fecha ? rep.fecha.slice(0,10) : ''}</td>
      <td>${rep.tecnico}</td>
      <td>${rep.estado}</td>
      <td>${rep.problema}</td>
      <td>
        <button class="reparaciones-btn edit" onclick="editRepair(this, ${idx})">Editar</button>
        <button class="reparaciones-btn delete" onclick="deleteRepair(${idx})">Eliminar</button>
      </td>
    `;
  });
}

function openEditModal(type, row=null){
  if (!deviceData || Object.keys(deviceData).length === 0) {
    mostrarPopupError('Los datos del dispositivo no están cargados. Intenta recargar la página.');
    return;
  }
  modalType = type;
  currentRepairRow = row;
  const modalFields = document.getElementById('modalFields');
  modalFields.innerHTML = '';

  // ...existing code...
  if(type==='basic'){
    document.getElementById('modalTitle').innerText = 'Editar Información Básica';
    modalFields.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;">
        <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:1rem;">
          <label>TRAZA: <input type="text" id="modal_trazaEquipo" value="${deviceData.trazaEquipo || ''}"></label>
          <label>Tipo:
            <select id="modal_tipo">
              <option value="Ordenador" ${deviceData.tipo==='Ordenador'?'selected':''}>Ordenador</option>
              <option value="Móvil" ${deviceData.tipo==='Móvil'?'selected':''}>Móvil</option>
              <option value="Pantalla" ${deviceData.tipo==='Pantalla'?'selected':''}>Pantalla</option>
              <option value="Teclado" ${deviceData.tipo==='Teclado'?'selected':''}>Teclado</option>
              <option value="Ratón" ${deviceData.tipo==='Ratón'?'selected':''}>Ratón</option>
              <option value="Otro" ${deviceData.tipo==='Otro'?'selected':''}>Otro</option>
            </select>
          </label>
          <label>Categoría: <input type="text" id="modal_categoria" value="${deviceData.categoria || ''}"></label>
          <label>Modelo: <input type="text" id="modal_modelo" value="${deviceData.modelo || ''}"></label>
          <label>Marca: <input type="text" id="modal_marca" value="${deviceData.marca || ''}"></label>
          <label>Nº Serie: <input type="text" id="modal_serie" value="${deviceData.serie || ''}"></label>
        </div>
        <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:1rem;">
          <label>Estado:
            <select id="modal_estado">
              <option value="Operativo" ${deviceData.estado==='Operativo'?'selected':''}>Operativo</option>
              <option value="En reparación" ${deviceData.estado==='En reparación'?'selected':''}>En reparación</option>
              <option value="Baja" ${deviceData.estado==='Baja'?'selected':''}>Baja</option>
              <option value="Stock" ${deviceData.estado==='Stock'?'selected':''}>Stock</option>
            </select>
          </label>
          <label>Ubicación: <input type="text" id="modal_ubicacion" value="${deviceData.ubicacion || ''}"></label>
          <label>Fecha de compra: <input type="date" id="modal_fechaCompra" value="${deviceData.fechaCompra ? deviceData.fechaCompra.slice(0,10) : ''}"></label>
          <label>Responsable: <input type="text" id="modal_empleadoActual" value="${deviceData.responsable || deviceData.empleado || ''}"></label>
          <label>Observaciones: <input type="text" id="modal_observaciones" value="${deviceData.observaciones || ''}"></label>
        </div>
      </div>
      <div class="modalActions" style="display:flex;justify-content:center;gap:2rem;margin-top:2rem;">
        <button id="btnGuardarModal" class="save-btn" style="background:#3b82f6;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Guardar</button>
        <button id="btnCancelarModal" class="cancel-btn" style="background:#9ca3af;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Cancelar</button>
      </div>
    `;
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
    }
    // Conectar los botones de la modal a las funciones
    setTimeout(() => {
      const btnGuardar = document.getElementById('btnGuardarModal');
      const btnCancelar = document.getElementById('btnCancelarModal');
      if(btnGuardar) btnGuardar.onclick = saveModal;
      if(btnCancelar) btnCancelar.onclick = closeModal;
    }, 10);
  }
  else if(type==='features'){
    document.getElementById('modalTitle').innerText = 'Editar Características';
    modalFields.innerHTML = `
      <label>CPU: <input type="text" id="modal_cpu" value="${deviceData.cpu || ''}"></label>
      <label>RAM: <input type="text" id="modal_ram" value="${deviceData.ram || ''}"></label>
      <label>Almacenamiento: <input type="text" id="modal_storage" value="${deviceData.storage || ''}"></label>
      <label>Sistema Operativo: <input type="text" id="modal_os" value="${deviceData.os || ''}"></label>
      <div style="display:flex;justify-content:center;gap:2rem;margin-top:2rem;">
        <button id="btnGuardarModal" style="background:#3b82f6;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Guardar</button>
        <button id="btnCancelarModal" style="background:#9ca3af;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Cancelar</button>
      </div>
    `;
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
    }
    setTimeout(() => {
      document.getElementById('btnGuardarModal').onclick = saveModal;
      document.getElementById('btnCancelarModal').onclick = closeModal;
    }, 10);
  }
  else if(type==='assignment'){
    document.getElementById('modalTitle').innerText = 'Añadir/Editar Asignación';
    modalFields.innerHTML = `
      <label>Empleado: <input type="text" id="modal_empleado" value=""></label>
      <label>Departamento: <input type="text" id="modal_depto" value=""></label>
      <label>Fecha inicio: <input type="date" id="modal_start" value=""></label>
      <label>Fecha fin: <input type="date" id="modal_end" value=""></label>
      <div style="display:flex;justify-content:center;gap:2rem;margin-top:2rem;">
        <button id="btnGuardarModal" style="background:#3b82f6;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Guardar</button>
        <button id="btnCancelarModal" style="background:#9ca3af;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Cancelar</button>
      </div>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('btnGuardarModal').onclick = saveModal;
      document.getElementById('btnCancelarModal').onclick = closeModal;
    }, 10);
  }
  else if(type==='repair'){
    document.getElementById('modalTitle').innerText = row !== null ? 'Editar Reparación' : 'Añadir Reparación';
    let tecnicoValue = '';
    if (row === null) {
      let usuarioRaw = localStorage.getItem('usuario');
      let usuario = {};
      if (usuarioRaw && usuarioRaw !== 'undefined') {
        usuario = JSON.parse(usuarioRaw);
      }
      tecnicoValue = usuario.nombre || '';
    } else {
      if (deviceData.reparaciones && deviceData.reparaciones[row]) {
        tecnicoValue = deviceData.reparaciones[row].tecnico || '';
      }
    }
    modalFields.innerHTML = `
      <label>Fecha: <input type="date" id="modal_fecha"></label>
      <label>Técnico: <input type="text" id="modal_tecnico" value="${tecnicoValue}" readonly></label>
      <label>Estado:
        <select id="modal_estado">
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Resuelto">Resuelto</option>
        </select>
      </label>
      <label>Problema: <input type="text" id="modal_problema"></label>
      <div style="display:flex;justify-content:center;gap:2rem;margin-top:2rem;">
        <button id="btnGuardarModal" style="background:#3b82f6;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Guardar</button>
        <button id="btnCancelarModal" style="background:#9ca3af;color:#fff;padding:0.7rem 2rem;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">Cancelar</button>
      </div>
    `;
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
    }
    setTimeout(() => {
      document.getElementById('btnGuardarModal').onclick = saveModal;
      document.getElementById('btnCancelarModal').onclick = closeModal;
    }, 10);
  }
    // El manejo de errores ya está dentro del fetch de empleados, no debe ir aquí fuera de bloque
  } // <-- Esta llave cierra la función openEditModal

function closeModal(){
  document.getElementById('modalOverlay').style.display='none';
  currentRepairRow = null;
}

function getBasicFormData() {
  return {
    tipo: document.getElementById('modal_tipo').value,
    categoria: document.getElementById('modal_categoria').value,
    nombre: document.getElementById('modal_nombre')?.value || '',
    modelo: document.getElementById('modal_modelo').value,
    marca: document.getElementById('modal_marca').value,
    serie: document.getElementById('modal_serie').value,
    estado: document.getElementById('modal_estado').value,
    ubicacion: document.getElementById('modal_ubicacion').value,
    fechaCompra: document.getElementById('modal_fechaCompra').value,
    responsable: document.getElementById('modal_empleadoActual').value,
    trazaEquipo: document.getElementById('modal_trazaEquipo')?.value || '',
    observaciones: document.getElementById('modal_observaciones')?.value || '',
    cpu: document.getElementById('modal_cpu')?.value || '',
    ram: document.getElementById('modal_ram')?.value || '',
    storage: document.getElementById('modal_storage')?.value || '',
    os: document.getElementById('modal_os')?.value || ''
  };
}

function isBasicDataChanged() {
  const formData = getBasicFormData();
  const original = deviceData;
  for (const key in formData) {
    if ((formData[key] || '') != (original[key] || '')) return true;
  }
  return false;
}

function getFeaturesFormData() {
  return {
    tipo: document.getElementById('modal_tipo')?.value || deviceData.tipo || '',
    nombre: document.getElementById('modal_nombre')?.value || deviceData.nombre || '',
    categoria: document.getElementById('modal_categoria')?.value || deviceData.categoria || '',
    marca: document.getElementById('modal_marca')?.value || deviceData.marca || '',
    modelo: document.getElementById('modal_modelo')?.value || deviceData.modelo || '',
    serie: document.getElementById('modal_serie')?.value || deviceData.serie || '',
    estado: document.getElementById('modal_estado')?.value || deviceData.estado || '',
    ubicacion: document.getElementById('modal_ubicacion')?.value || deviceData.ubicacion || '',
    responsable: document.getElementById('modal_empleadoActual')?.value || deviceData.responsable || deviceData.empleado || '',
    fechaCompra: document.getElementById('modal_fechaCompra')?.value || deviceData.fechaCompra || '',
    observaciones: document.getElementById('modal_observaciones')?.value || deviceData.observaciones || '',
    cpu: document.getElementById('modal_cpu').value,
    ram: document.getElementById('modal_ram').value,
    storage: document.getElementById('modal_storage').value,
    os: document.getElementById('modal_os').value
  };
}

function isFeaturesDataChanged() {
  const formData = getFeaturesFormData();
  const original = deviceData;
  for (const key in formData) {
    if ((formData[key] || '') != (original[key] || '')) return true;
  }
  return false;
}

async function saveModal(){
  if(!deviceId) return;
  if(modalType==='basic'){
    if (!isBasicDataChanged()) {
      closeModal();
      return;
    }
    await mostrarPopupConfirmacion('¿Seguro que quieres guardar estos datos?', async () => {
      const update = getBasicFormData();
      try {
        const res = await fetch(`${API_BASE_URL}/ordenador/${deviceId}`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(update)
        });
        if (!res.ok) {
          let errorMsg = 'Error al actualizar el dispositivo';
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorMsg;
          } catch {}
          alert(errorMsg);
          return;
        }
        await fetchDevice();
        closeModal();
      } catch (err) {
        alert('Error al actualizar el dispositivo: ' + err.message);
      }
    }, { confirmText: 'Guardar', cancelText: 'Cancelar', iconColor: '#3b82f6' });
  }
  else if(modalType==='features'){
    if (!isFeaturesDataChanged()) {
      closeModal();
      return;
    }
    await mostrarPopupConfirmacion('¿Seguro que quieres guardar las características?', async () => {
      const update = getFeaturesFormData();
      try {
        const res = await fetch(`${API_BASE_URL}/ordenador/${deviceId}`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(update)
        });
        if (!res.ok) {
          let errorMsg = 'Error al actualizar las características';
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorMsg;
          } catch {}
          alert(errorMsg);
          return;
        }
        await fetchDevice();
        closeModal();
      } catch (err) {
        alert('Error al actualizar las características: ' + err.message);
      }
    }, { confirmText: 'Guardar', cancelText: 'Cancelar', iconColor: '#3b82f6' });
  }
  else if(modalType==='assignment'){
    // Guardar asignación (añadir o editar)
    const nueva = {
      empleado: document.getElementById('modal_empleado').value,
      departamento: document.getElementById('modal_depto').value,
      inicio: document.getElementById('modal_start').value,
      fin: document.getElementById('modal_end').value
    };
    try {
      let asignaciones = deviceData.asignaciones || [];
      const editIdx = document.getElementById('modalFields').getAttribute('data-edit-assignment');
      if (editIdx !== null && editIdx !== '' && !isNaN(editIdx)) {
        asignaciones[parseInt(editIdx)] = nueva;
      } else {
        asignaciones.push(nueva);
      }
      await fetch(`${API_BASE_URL}/ordenador/${deviceId}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({asignaciones})
      });
      await fetchDevice();
      document.getElementById('modalFields').removeAttribute('data-edit-assignment');
      closeModal();
    } catch { mostrarPopupError('El servidor no responde. No se pudo guardar la asignación.'); }
  }
  else if(modalType==='repair'){
    const nueva = {
      fecha: document.getElementById('modal_fecha').value,
      tecnico: document.getElementById('modal_tecnico').value,
      estado: document.getElementById('modal_estado').value,
      problema: document.getElementById('modal_problema').value
    };
    try {
      let reparaciones = deviceData.reparaciones || [];
      const editIdx = document.getElementById('modalFields').getAttribute('data-edit-repair');
      if (editIdx !== null && editIdx !== '' && !isNaN(editIdx)) {
        reparaciones[parseInt(editIdx)] = nueva;
      } else {
        reparaciones.push(nueva);
      }
      await fetch(`${API_BASE_URL}/ordenador/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reparaciones })
      });
      await fetchDevice();
      document.getElementById('modalFields').removeAttribute('data-edit-repair');
      closeModal();
    } catch { mostrarPopupError('El servidor no responde. No se pudo guardar la reparación.'); }
  }
}

function mostrarPopupError(mensaje) {
  let popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100vw';
  popup.style.height = '100vh';
  popup.style.background = 'rgba(30,58,138,0.85)';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';
  popup.style.zIndex = '9999';
  popup.innerHTML = `<div style="background:#fff; color:#ef4444; padding:2.5rem 2.5rem; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.12); font-size:1.2rem; font-weight:600; text-align:center; max-width:90vw;">
    <i class='fa-solid fa-triangle-exclamation' style='font-size:2.5rem; color:#ef4444; margin-bottom:1rem;'></i><br>
    ${mensaje}<br><br>
    <button onclick="this.parentElement.parentElement.remove()" style="margin-top:1rem; background:#ef4444; color:#fff; border:none; border-radius:8px; padding:0.7rem 1.5rem; font-size:1rem; cursor:pointer;">Cerrar</button>
  </div>`;
  document.body.appendChild(popup);
}

function editRepair(btn, idx){
  openEditModal('repair');
  setTimeout(() => {
    const rep = deviceData.reparaciones[idx];
    document.getElementById('modal_fecha').value = rep.fecha ? rep.fecha.slice(0,10) : '';
    document.getElementById('modal_tecnico').value = rep.tecnico || '';
    document.getElementById('modal_estado').value = rep.estado || '';
    document.getElementById('modal_problema').value = rep.problema || '';
    document.getElementById('modalFields').setAttribute('data-edit-repair', idx);
    document.getElementById('modalTitle').innerText = 'Editar Reparación';
  }, 300);
}

async function deleteRepair(idx) {
  if (!deviceId) return;
  await mostrarPopupConfirmacion('¿Seguro que quieres eliminar este historial?', async () => {
    let reparaciones = deviceData.reparaciones || [];
    reparaciones.splice(idx, 1);
    await fetch(`${API_BASE_URL}/ordenador/${deviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reparaciones })
    });
    await fetchDevice();
  });
}