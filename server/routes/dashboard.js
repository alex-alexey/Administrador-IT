import express from 'express';
import Inventario from '../models/Inventario.js';
import Usuario from '../models/Usuario.js';
import Ticket from '../models/Ticket.js';
import Licencia from '../models/Licencia.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Número de usuarios registrados
    let usuariosRegistrados = 0;
    try { usuariosRegistrados = await Usuario.countDocuments(); } catch {}
    // Número de dispositivos IT
    let dispositivosIT = 0;
    try { dispositivosIT = await Inventario.countDocuments(); } catch {}
    // Número de licencias próximas a caducar
    let licenciasPorCaducar = 0;
    try {
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      const en30dias = new Date(hoy);
      en30dias.setDate(hoy.getDate() + 30);
      const licencias = await Licencia.find({ expiracion: { $exists: true, $ne: null } });
      licenciasPorCaducar = licencias.filter(l => {
        const exp = new Date(l.expiracion);
        exp.setHours(0,0,0,0);
        return exp > hoy && exp <= en30dias;
      }).length;
    } catch {}
    res.json({ usuariosRegistrados, dispositivosIT, licenciasPorCaducar });
  } catch (err) {
    res.json({ usuariosRegistrados: 0, dispositivosIT: 0, licenciasPorCaducar: 0 });
  }
});

export default router;
