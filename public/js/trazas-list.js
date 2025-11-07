// trazas-list.js
// Devuelve el listado de trazas de ordenadores para usar en formularios y selects

export async function getTrazasOptions(selected = '') {
  try {
    const res = await fetch('http://localhost:4000/api/inventario');
    const inventario = await res.json();
    const trazas = inventario.map(item => item.trazaEquipo).filter(Boolean);
    return '<option value="">Selecciona traza...</option>' +
      trazas.map(traza => `<option value="${traza}"${traza === selected ? ' selected' : ''}>${traza}</option>`).join('');
  } catch {
    return '<option value="">No se pudo cargar trazas</option>';
  }
}
