
import express from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import Inventario from '../models/Inventario.js';
import Licencia from '../models/Licencia.js';
import Ticket from '../models/Ticket.js';
const router = express.Router();

// Middleware de autenticación JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Token no proporcionado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }
}

router.get('/', async (req, res) => {
  authMiddleware(req, res, async () => {
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
      // Número de tickets abiertos
      let ticketsAbiertos = 0;
      try {
        ticketsAbiertos = await Ticket.countDocuments({ estado: 'Abierto' });
      } catch {}
      res.json({ usuariosRegistrados, dispositivosIT, licenciasPorCaducar, ticketsAbiertos });
    } catch (err) {
      res.json({ usuariosRegistrados: 0, dispositivosIT: 0, licenciasPorCaducar: 0 });
    }
  });
});

export default router;
