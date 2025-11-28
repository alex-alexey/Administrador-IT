import express from 'express';
import Empleado from '../models/Empleado.js';
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

// Obtener un empleado por ID
router.get('/:id', async (req, res) => {
  authMiddleware(req, res, async () => {
    try {
      console.log(`[EMPLEADOS] Consulta de empleado por ID: ${req.params.id}, fecha=${new Date().toISOString()}`);
      const empleado = await Empleado.findById(req.params.id);
      if (!empleado) {
        console.warn(`[EMPLEADOS] Empleado no encontrado: ${req.params.id}`);
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      res.json(empleado);
    } catch (err) {
      console.error(`[EMPLEADOS] Error al consultar empleado (${req.params.id}): ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });
});
router.get('/', async (req, res) => {
  authMiddleware(req, res, async () => {
    try {
      console.log(`[EMPLEADOS] Consulta de todos los empleados, fecha=${new Date().toISOString()}`);
      const empleados = await Empleado.find();
      res.json(empleados);
    } catch (err) {
      console.error(`[EMPLEADOS] Error al consultar empleados: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });
});

// Crear un empleado
router.post('/', async (req, res) => {
  authMiddleware(req, res, async () => {
    if (!['adminIT', 'rrhh'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para crear empleados.' });
    }
    try {
      console.log(`[EMPLEADOS] Creación de empleado: nombre=${req.body.nombre}, fecha=${new Date().toISOString()}`);
      const empleado = new Empleado(req.body);
      await empleado.save();
      res.status(201).json(empleado);
    } catch (err) {
      console.error(`[EMPLEADOS] Error al crear empleado: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  });
});


// Editar un empleado
router.put('/:id', async (req, res) => {
  try {
    console.log(`[EMPLEADOS] Edición de empleado: id=${req.params.id}, fecha=${new Date().toISOString()}`);
    const empleado = await Empleado.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!empleado) {
      console.warn(`[EMPLEADOS] Empleado no encontrado para edición: ${req.params.id}`);
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(empleado);
  } catch (err) {
    console.error(`[EMPLEADOS] Error al editar empleado (${req.params.id}): ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un empleado
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[EMPLEADOS] Eliminación de empleado: id=${req.params.id}, fecha=${new Date().toISOString()}`);
    await Empleado.findByIdAndDelete(req.params.id);
    res.json({ message: 'Empleado eliminado' });
  } catch (err) {
    console.error(`[EMPLEADOS] Error al eliminar empleado (${req.params.id}): ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

export default router;
