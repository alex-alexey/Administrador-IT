import express from 'express';
import Inventario from '../models/Inventario.js';
const router = express.Router();

// Obtener todos los items
// Obtener un item por id
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventario.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Error al obtener el item', details: err.message });
  }
});
router.get('/', async (req, res) => {
  const items = await Inventario.find();
  res.json(items);
});

// Crear nuevo item
router.post('/', async (req, res) => {
  try {
    const item = new Inventario(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el item', details: err.message });
  }
});

// Editar item
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Error al editar el item', details: err.message });
  }
});

// Eliminar item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventario.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json({ mensaje: 'Item eliminado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar el item', details: err.message });
  }
});

export default router;
