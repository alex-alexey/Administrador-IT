import express from 'express';
import Ticket from '../models/Ticket.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Crear ticket
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, prioridad, asunto, descripcion } = req.body;
    const usuario = req.user.nombre || req.user.email || req.user.id;
    const ticket = new Ticket({
      asunto,
      usuario,
      prioridad,
      estado: 'Abierto',
      fecha: new Date(),
      tipo,
      descripcion
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar tickets (solo adminIT)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'adminIT') {
    return res.status(403).json({ error: 'Acceso restringido' });
  }
  try {
    const tickets = await Ticket.find().sort({ fecha: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
