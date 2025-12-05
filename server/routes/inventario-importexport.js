import express from 'express';
import Inventario from '../models/Inventario.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import XLSX from 'xlsx';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Token no proporcionado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }
}

// Importar inventario desde Excel/CSV y añadir solo nuevos registros
router.post('/import', authMiddleware, upload.single('file'), async (req, res) => {
  if (!['adminIT', 'tecnico'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'No tienes permisos para importar.' });
  }
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    let nuevos = 0;
    for (const row of data) {
      // Consideramos 'serie' como identificador único
      if (!row.serie) continue;
      const existe = await Inventario.findOne({ serie: row.serie });
      if (!existe) {
        const nuevo = new Inventario(row);
        await nuevo.save();
        nuevos++;
      }
    }
    res.json({ mensaje: `Importación completada. ${nuevos} nuevos dispositivos añadidos.` });
  } catch (err) {
    res.status(500).json({ error: 'Error al importar el archivo.' });
  }
});

// Exportar inventario a Excel
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const inventario = await Inventario.find();
    const ws = XLSX.utils.json_to_sheet(inventario.map(i => i.toObject()));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="inventario.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar el inventario.' });
  }
});

export default router;
