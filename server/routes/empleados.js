import express from 'express';
import Empleado from '../models/Empleado.js';

const router = express.Router();

// Obtener todos los empleados
// Obtener un empleado por ID
router.get('/:id', async (req, res) => {
  try {
    const empleado = await Empleado.findById(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un empleado
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      departamento,
      correo,
      fechaIncorporacion,
      cargo,
      estadoLaboral,
      licenciasAsignadas,
      azureDevOps,
      almacenamiento,
      sistemaOperativo,
      dispositivosAsignados,
      asignaciones,
      reparaciones
    } = req.body;
    const empleado = new Empleado({
      nombre,
      departamento,
      correo,
      fechaIncorporacion,
      cargo,
      estadoLaboral,
      licenciasAsignadas,
      azureDevOps,
      almacenamiento,
      sistemaOperativo,
      dispositivosAsignados,
      asignaciones,
      reparaciones
    });
    await empleado.save();
    res.status(201).json(empleado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Editar un empleado
router.put('/:id', async (req, res) => {
  try {
    const {
      nombre,
      departamento,
      correo,
      fechaIncorporacion,
      cargo,
      estadoLaboral,
      licenciasAsignadas,
      azureDevOps,
      almacenamiento,
      sistemaOperativo,
      dispositivosAsignados,
      asignaciones,
      reparaciones
    } = req.body;
    const empleado = await Empleado.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        departamento,
        correo,
        fechaIncorporacion,
        cargo,
        estadoLaboral,
        licenciasAsignadas,
        azureDevOps,
        almacenamiento,
        sistemaOperativo,
        dispositivosAsignados,
        asignaciones,
        reparaciones
      },
      { new: true }
    );
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un empleado
router.delete('/:id', async (req, res) => {
  try {
    await Empleado.findByIdAndDelete(req.params.id);
    res.json({ message: 'Empleado eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
