// Script para obtener el listado de empleados y exponerlo para el front
export async function getEmpleadosList() {
  try {
    const res = await fetch('http://localhost:4000/api/empleados');
    if (!res.ok) throw new Error('No se pudo obtener el listado de empleados');
    return await res.json();
  } catch {
    return [];
  }
}
