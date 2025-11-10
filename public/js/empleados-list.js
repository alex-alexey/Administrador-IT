// Script para obtener el listado de empleados y exponerlo para el front
export async function getEmpleadosList() {
  try {
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:4000"
      : "https://it-xqhv.onrender.com";

      const res = await fetch(`${API_BASE_URL}/api/empleados`);
    if (!res.ok) throw new Error('No se pudo obtener el listado de empleados');
    return await res.json();
  } catch {
    return [];
  }
}
