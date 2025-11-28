import express from 'express';
import Inventario from '../models/Inventario.js';
import jwt from 'jsonwebtoken';
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

router.get('/:id', async (req, res) => {
  console.log('GET /api/ordenador/:id');
  console.log('ID recibido:', req.params.id);
  console.log('Authorization:', req.headers['authorization']);
  authMiddleware(req, res, async () => {
    try {
      const equipo = await Inventario.findById(req.params.id);
      console.log('Equipo encontrado:', equipo);
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
      res.json(equipo);
    } catch (err) {
      console.error('Error en GET /api/ordenador/:id:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// Actualizar dispositivo por ID
router.put('/:id', async (req, res) => {
  authMiddleware(req, res, async () => {
    if (!['adminIT', 'rrhh'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar equipos.' });
    }
    try {
      const equipo = await Inventario.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
      res.json(equipo);
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

export default router;