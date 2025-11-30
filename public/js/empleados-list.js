// Script para obtener el listado de empleados y exponerlo para el front
// Unificación de API_BASE_URL
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://it-xqhv.onrender.com/api';

export async function getEmpleadosList() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/empleados`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('No se pudo obtener el listado de empleados');
    return await res.json();
  } catch {
    return [];
  }
}
