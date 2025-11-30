import express from 'express';
import Categoria from '../models/Categoria.js';

const router = express.Router();

// Listar categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crear nueva categoría
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
    const categoria = new Categoria({ nombre });
    await categoria.save();
    res.status(201).json(categoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
