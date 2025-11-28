// auth.js - protección de páginas y control de acceso por rol

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')));
  } catch {
    return null;
  }
}

function requireAuth(rolesPermitidos = []) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!token || !user) {
    window.location.href = '/login.html';
    return false;
  }
  // Validar expiración del token
  const payload = parseJwt(token);
  if (!payload || (payload.exp && Date.now() / 1000 > payload.exp)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('expiredMsg', 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
    window.location.href = '/login.html';
    return false;
  }
  if (rolesPermitidos.length && !rolesPermitidos.includes(user.rol)) {
    document.body.innerHTML = '<h2 style="color:#dc2626;text-align:center;margin-top:4rem;">No tienes permisos para acceder a esta página.</h2>';
    return false;
  }
  return true;
}

// Ejemplo de uso:
// requireAuth(['adminIT', 'tecnico']);
