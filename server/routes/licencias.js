import express from 'express';
import Licencia from '../models/Licencia.js';
const router = express.Router();
import path from 'path';

// Obtener una licencia por ID
router.get('/:id', async (req, res) => {
  try {
    const licencia = await Licencia.findById(req.params.id);
    if (!licencia) return res.status(404).json({ error: 'Licencia no encontrada' });
    res.json(licencia);
  } catch (err) {
    res.status(400).json({ error: 'Error al obtener licencia', details: err.message });
  }
});

// Obtener todas las licencias
router.get('/', async (req, res) => {
  try {
    const licencias = await Licencia.find();
    res.json(licencias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener licencias' });
  }
});

// Crear una nueva licencia
router.post('/', async (req, res) => {
  try {
    // Limpiar y convertir campos
    const body = { ...req.body };
    // Convertir costeSinIva
    if (body.costeSinIva === '' || body.costeSinIva === null || isNaN(Number(body.costeSinIva))) {
      body.costeSinIva = undefined;
    } else {
      body.costeSinIva = Number(body.costeSinIva);
    }
    // Convertir fechas
    [
      'fechaAdquisicion',
      'fechaUltimaRenovacion',
      'fechaRenovacion',
      'contratacion',
      'expiracion'
    ].forEach(f => {
      if (!body[f] || isNaN(Date.parse(body[f]))) {
        body[f] = undefined;
      } else {
        body[f] = new Date(body[f]);
      }
    });
    // Validar que al menos un campo relevante esté presente
    const camposRelevantes = [
      'licencia','proveedor','serialNumber','empleadoAsignado','nombreLicencia','software','usuario','departamento','estado'
    ];
    const tieneDatos = camposRelevantes.some(c => body[c] && String(body[c]).trim() !== '');
    if (!tieneDatos) {
      return res.status(400).json({ error: 'Datos insuficientes para crear licencia', details: 'Todos los campos relevantes están vacíos.' });
    }
    const licencia = new Licencia(body);
    await licencia.save();
    res.status(201).json(licencia);
  } catch (err) {
    console.error('Error al crear licencia:', err);
    res.status(400).json({ error: 'Error al crear licencia', details: err.message });
  }
});

// Actualizar una licencia
router.put('/:id', async (req, res) => {
  try {
    const licencia = await Licencia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!licencia) return res.status(404).json({ error: 'Licencia no encontrada' });
    res.json(licencia);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar licencia' });
  }
});

// Eliminar una licencia
router.delete('/:id', async (req, res) => {
  try {
    const licencia = await Licencia.findByIdAndDelete(req.params.id);
    if (!licencia) return res.status(404).json({ error: 'Licencia no encontrada' });
    res.json({ message: 'Licencia eliminada' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar licencia' });
  }
});

// Obtener una licencia por ID (para el frontend)
router.get('/licencia/:id', (req, res) => {
  const licenciaPath = path.join(publicPath, 'licencia.html');
  res.sendFile(licenciaPath);
});

export default router;
