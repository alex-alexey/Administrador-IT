import express from 'express';
import Inventario from '../models/Inventario.js';
const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const equipo = await Inventario.findById(req.params.id);
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar dispositivo por ID
router.put('/:id', async (req, res) => {
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

export default router;