const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

const usuariosTableBody = document.getElementById('usuariosTableBody');
const btnAddUser = document.getElementById('btnAddUser');
const modalUserOverlay = document.getElementById('modalUserOverlay');
const formUser = document.getElementById('formUser');
const btnCancelUser = document.getElementById('btnCancelUser');
const modalUserTitle = document.getElementById('modalUserTitle');

let usuarios = [];
let editUserId = null;

async function fetchUsuarios() {
  const res = await fetch(`${API_BASE_URL}/usuarios`);
  const data = await res.json();
  usuarios = data.usuarios || [];
  renderUsuariosTable();
}

function renderUsuariosTable() {
  usuariosTableBody.innerHTML = '';
  usuarios.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.nombre}</td>
      <td>${user.email}</td>
      <td>${user.departamento || ''}</td>
      <td>${user.rol}</td>
      <td>
        <button class="edit" data-id="${user._id}">Editar</button>
        <button class="delete" data-id="${user._id}">Eliminar</button>
      </td>
    `;
    tr.querySelector('.edit').onclick = () => openEditUser(user);
    tr.querySelector('.delete').onclick = () => deleteUser(user._id);
    usuariosTableBody.appendChild(tr);
  });
}

btnAddUser.onclick = () => {
  editUserId = null;
  modalUserTitle.textContent = 'Añadir Usuario';
  formUser.reset();
  modalUserOverlay.style.display = 'flex';
};

btnCancelUser.onclick = () => {
  modalUserOverlay.style.display = 'none';
};

formUser.onsubmit = async function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formUser));
  let url = `${API_BASE_URL}/usuarios/register`;
  let method = 'POST';
  if (editUserId) {
    url = `${API_BASE_URL}/usuarios/${editUserId}`;
    method = 'PUT';
  }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    modalUserOverlay.style.display = 'none';
    fetchUsuarios();
  } else {
    alert('Error al guardar el usuario');
  }
};

function openEditUser(user) {
  editUserId = user._id;
  modalUserTitle.textContent = 'Editar Usuario';
  formUser.nombre.value = user.nombre;
  formUser.email.value = user.email;
  formUser.departamento.value = user.departamento || '';
  formUser.rol.value = user.rol;
  formUser.contrasena.value = '';
  formUser.equipoAsignado.value = user.equipoAsignado || '';
  formUser.pantallaAsignada.value = user.pantallaAsignada || '';
  modalUserOverlay.style.display = 'flex';
}

async function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'DELETE' });
  if (res.ok) fetchUsuarios();
  else alert('Error al eliminar usuario');
}

document.addEventListener('DOMContentLoaded', fetchUsuarios);
