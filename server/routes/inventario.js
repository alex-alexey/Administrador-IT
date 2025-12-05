
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
  authMiddleware(req, res, async () => {
    if (!['adminIT', 'tecnico'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para crear dispositivos.' });
    }
    try {
      const nuevoDispositivo = new Inventario({
        tipo: req.body.tipo,
        trazaEquipo: req.body.trazaEquipo,
        nombre: req.body.nombre,
        categoria: req.body.categoria,
        marca: req.body.marca,
        modelo: req.body.modelo,
        serie: req.body.serie,
        estado: req.body.estado,
        ubicacion: req.body.ubicacion,
        responsable: req.body.responsable,
        empleado: req.body.empleado,
        fechaCompra: req.body.fechaCompra,
        observaciones: req.body.observaciones,
        cpu: req.body.cpu,
        ram: req.body.ram,
        storage: req.body.storage,
        os: req.body.os,
        asignaciones: req.body.asignaciones || [],
        reparaciones: req.body.reparaciones || []
      });
      await nuevoDispositivo.save();
      res.status(201).json({ mensaje: 'Dispositivo creado correctamente', dispositivo: nuevoDispositivo });
    } catch (err) {
      console.error('Error al crear dispositivo:', err);
      res.status(500).json({ error: 'Error al crear el dispositivo' });
    }
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
