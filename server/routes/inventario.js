
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

// Obtener todos los equipos
router.get('/', async (req, res) => {
  authMiddleware(req, res, async () => {
    try {
      console.log('Token recibido:', req.headers['authorization']);
      const equipos = await Inventario.find();
      console.log('Enviando inventario:', equipos.length, 'dispositivos');
      res.json(equipos);
    } catch (err) {
      console.error('Error en inventario:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

router.get('/:id', async (req, res) => {
  authMiddleware(req, res, async () => {
    try {
      const equipo = await Inventario.findById(req.params.id);
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
      res.json(equipo);
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});
// Ejemplo de control de rol en POST y DELETE
router.post('/', (req, res) => {
  authMiddleware(req, res, () => {
    if (!['adminIT', 'tecnico'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para crear dispositivos.' });
    }
    // ...lógica de creación aquí...
    res.json({ mensaje: 'Dispositivo creado (ejemplo)' });
  });
});

router.delete('/:id', (req, res) => {
  authMiddleware(req, res, () => {
    if (req.user.rol !== 'adminIT') {
      return res.status(403).json({ error: 'Solo adminIT puede eliminar dispositivos.' });
    }
    // ...lógica de eliminación aquí...
    res.json({ mensaje: 'Dispositivo eliminado (ejemplo)' });
  });
});

export default router;
