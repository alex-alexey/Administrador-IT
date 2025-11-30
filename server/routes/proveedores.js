import express from 'express';
import Proveedor from '../models/Proveedor.js';

const router = express.Router();

// Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const proveedores = await Proveedor.find({ activo: true });
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Añadir proveedor
router.post('/', async (req, res) => {
  try {
    const proveedor = new Proveedor(req.body);
    await proveedor.save();
    res.status(201).json(proveedor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
