// estados-equipo-list.js
// Devuelve el listado de estados de equipo para usar en formularios y selects

export const estadosEquipo = [
  'Operativo',
  'En reparación',
  'Stock'
];

export function getEstadosEquipoOptions(selected = '') {
  return '<option value="">Selecciona estado...</option>' +
    estadosEquipo.map(est => `<option value="${est}"${est === selected ? ' selected' : ''}>${est}</option>`).join('');
}
