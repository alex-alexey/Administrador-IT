console.log('Script login.js cargado');
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

const formLogin = document.getElementById('formLogin');
const errorMsg = document.getElementById('loginError');

// Mostrar mensaje de sesión expirada si existe
if (sessionStorage.getItem('expiredMsg')) {
  errorMsg.textContent = sessionStorage.getItem('expiredMsg');
  sessionStorage.removeItem('expiredMsg');
}

formLogin.onsubmit = async function(e) {
  e.preventDefault();
  errorMsg.textContent = '';
  const data = Object.fromEntries(new FormData(formLogin));
  const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (result.success && result.token) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.data));
    // Redirección según rol
    switch(result.data.rol) {
      case 'adminIT':
        window.location.href = '/dashboard.html';
        break;
      case 'empleado':
        window.location.href = '/empleados.html';
        break;
      case 'tecnico':
        window.location.href = '/inventario.html';
        break;
      case 'rrhh':
        window.location.href = '/licencias.html';
        break;
      case 'manager':
        window.location.href = '/dashboard.html';
        break;
      default:
        window.location.href = '/dashboard.html';
    }
  } else {
    errorMsg.textContent = result.error || 'Error de autenticación';
  }
};
