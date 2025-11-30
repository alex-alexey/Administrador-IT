// helpdesk.js - Lógica para envío de tickets desde el formulario

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('helpdeskForm');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para enviar un ticket.');
      window.location.href = '/login.html';
      return;
    }
    // Construir objeto para API
    const data = {
      tipo: form.tipo.value,
      prioridad: form.prioridad.value,
      asunto: form.asunto.value,
      descripcion: form.descripcion.value
    };
    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:4000/api'
        : 'https://it-xqhv.onrender.com/api';
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        alert('Error al enviar el ticket: ' + (error.error || res.status));
        return;
      }
  document.getElementById('popupSuccess').style.display = 'flex';
  form.reset();
    } catch (err) {
      alert('Error de red o servidor. Intenta de nuevo.');
    }
  });
});
