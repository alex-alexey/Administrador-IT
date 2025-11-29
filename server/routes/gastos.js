
import express from 'express';
import Gasto from '../models/Gasto.js';
import Proveedor from '../models/Proveedor.js';

const router = express.Router();

// Listar gastos con nombre de proveedor
router.get('/', async (req, res) => {
  try {
    const gastos = await Gasto.find().populate('proveedor', 'nombre');
    const gastosFront = gastos.map(g => ({
      _id: g._id,
      proveedor: g.proveedor?._id,
      proveedorNombre: g.proveedor?.nombre,
      monto: g.monto,
      categoria: g.categoria,
      fecha: g.fecha,
      numeroFactura: g.numeroFactura,
      usuarioSolicitante: g.usuarioSolicitante,
      empleadoResponsable: g.empleadoResponsable,
      departamento: g.departamento,
      proyecto: g.proyecto,
      estadoAprobacion: g.estadoAprobacion,
      fechaExpiracion: g.fechaExpiracion,
      diasRestantes: g.diasRestantes,
      estadoRenovacion: g.estadoRenovacion,
      periodicidad: g.periodicidad,
      importeRenovacion: g.importeRenovacion,
      notasRenovacion: g.notasRenovacion
    }));
    res.json(gastosFront);
  } catch (err) {
    res.status(400).json({ error: 'Error al listar gastos', details: err.message });
  }
});

// Obtener un gasto por ID
router.get('/:id', async (req, res) => {
  try {
    const gasto = await Gasto.findById(req.params.id).populate('proveedor', 'nombre');
    if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({
      _id: gasto._id,
      proveedor: gasto.proveedor?._id,
      proveedorNombre: gasto.proveedor?.nombre,
      monto: gasto.monto,
      categoria: gasto.categoria,
      fecha: gasto.fecha,
      numeroFactura: gasto.numeroFactura,
      usuarioSolicitante: gasto.usuarioSolicitante,
      empleadoResponsable: gasto.empleadoResponsable,
      departamento: gasto.departamento,
      proyecto: gasto.proyecto,
      estadoAprobacion: gasto.estadoAprobacion,
      fechaExpiracion: gasto.fechaExpiracion,
      diasRestantes: gasto.diasRestantes,
      estadoRenovacion: gasto.estadoRenovacion,
      periodicidad: gasto.periodicidad,
      importeRenovacion: gasto.importeRenovacion,
      notasRenovacion: gasto.notasRenovacion
    });
  } catch (err) {
    res.status(400).json({ error: 'Error al obtener gasto', details: err.message });
  }
});

// Crear gasto
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.fechaExpiracion) {
      const hoy = new Date();
      const fechaExp = new Date(body.fechaExpiracion);
      const diff = Math.ceil((fechaExp - hoy) / (1000 * 60 * 60 * 24));
      body.diasRestantes = diff;
    }
    const gasto = new Gasto(body);
    await gasto.save();
    res.status(201).json(gasto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
// Actualizar gasto y recalcular días restantes
router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.fechaExpiracion) {
      const hoy = new Date();
      const fechaExp = new Date(body.fechaExpiracion);
      const diff = Math.ceil((fechaExp - hoy) / (1000 * 60 * 60 * 24));
      body.diasRestantes = diff;
    }
    const gasto = await Gasto.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json(gasto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
});

export default router;
