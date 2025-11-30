import express from 'express';
import Departamento from '../models/Departamento.js';

const router = express.Router();

// Obtener todos los departamentos activos
router.get('/', async (req, res) => {
  try {
    const departamentos = await Departamento.find({ activo: true });
    res.json(departamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear departamento
router.post('/', async (req, res) => {
  try {
    const departamento = new Departamento(req.body);
    await departamento.save();
    res.status(201).json(departamento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
