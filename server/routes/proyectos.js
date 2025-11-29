import express from 'express';
import Proyecto from '../models/Proyecto.js';

const router = express.Router();

// Obtener todos los proyectos activos
router.get('/', async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ activo: true });
    res.json(proyectos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear proyecto
router.post('/', async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
