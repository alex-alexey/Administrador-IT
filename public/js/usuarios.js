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
  const token = localStorage.getItem('token');
  if (!token) {
    usuariosTableBody.innerHTML = '<tr><td colspan="5">No tienes acceso. Inicia sesión.</td></tr>';
    return;
  }
  const res = await fetch(`${API_BASE_URL}/usuarios`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('token');
  let url = `${API_BASE_URL}/usuarios/crear`;
  let method = 'POST';
  if (editUserId) {
    url = `${API_BASE_URL}/usuarios/${editUserId}`;
    method = 'PUT';
  }
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok && result.success) {
      alert(result.mensaje || 'Usuario creado correctamente');
      modalUserOverlay.style.display = 'none';
      fetchUsuarios();
    } else {
      alert(result.error || 'Error al guardar el usuario');
    }
  } catch (err) {
    alert('Error de red o servidor.');
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
  modalUserOverlay.style.display = 'flex';
}

async function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await res.json();
    if (res.ok && result.success) {
      alert(result.mensaje || 'Usuario eliminado correctamente');
      fetchUsuarios();
    } else {
      alert(result.error || 'Error al eliminar usuario');
    }
  } catch (err) {
    alert('Error de red o servidor.');
  }
}

document.addEventListener('DOMContentLoaded', fetchUsuarios);
