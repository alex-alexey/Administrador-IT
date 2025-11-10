import { Router } from 'express';
import Dominio from '../models/Dominio.js';
const router = Router();

// Obtener todos los dominios
router.get('/', async (req, res) => {
  try {
    const dominios = await Dominio.find();
    res.json(dominios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dominios' });
  }
});

// Obtener un dominio por ID
router.get('/:id', async (req, res) => {
  try {
    const dominio = await Dominio.findById(req.params.id);
    if (!dominio) return res.status(404).json({ error: 'Dominio no encontrado' });
    res.json(dominio);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el dominio' });
  }
});

// Crear un dominio
router.post('/', async (req, res) => {
  try {
    const dominio = new Dominio(req.body);
    await dominio.save();
    res.status(201).json(dominio);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el dominio' });
  }
});

// Actualizar un dominio
router.put('/:id', async (req, res) => {
  try {
    const dominio = await Dominio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dominio) return res.status(404).json({ error: 'Dominio no encontrado' });
    res.json(dominio);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el dominio' });
  }
});

// Eliminar un dominio
router.delete('/:id', async (req, res) => {
  try {
    const dominio = await Dominio.findByIdAndDelete(req.params.id);
    if (!dominio) return res.status(404).json({ error: 'Dominio no encontrado' });
    res.json({ message: 'Dominio eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el dominio' });
  }
});

export default router;
