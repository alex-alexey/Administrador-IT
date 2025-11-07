// departamentos-list.js
// Devuelve el listado de departamentos para usar en formularios y selects

export const departamentos = [
  'IT',
  'GERENCIA',
  'MECANICA',
  'HARDWARE',
  'CONNECTED',
  'CONTABILIDAD'
];

export function getDepartamentosOptions(selected = '') {
  return '<option value="">Selecciona departamento...</option>' +
    departamentos.map(dep => `<option value="${dep}"${dep === selected ? ' selected' : ''}>${dep}</option>`).join('');
}
