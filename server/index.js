import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import empleadosRouter from './routes/empleados.js';
import licenciasRouter from './routes/licencias.js';
import inventarioRouter from './routes/inventario.js';
import usuariosRouter from './routes/usuarios.js';
import dashboardRouter from './routes/dashboard.js';
import dominiosRouter from './routes/dominios.js';
import ordenadorRoutes from './routes/ordenador.js';
import categoriasRouter from './routes/categorias.js';
import ticketsRouter from './routes/tickets.js';
import inventarioImportExportRoutes from './routes/inventario-importexport.js';

const app = express();
console.log('Arrancando index.js principal');
console.log('INICIO index.js');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// Rutas API
// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Rutas API (deben ir antes de servir archivos estáticos y redirecciones)


import gastosRouter from './routes/gastos.js';
app.use('/api/gastos', gastosRouter);
import proveedoresRouter from './routes/proveedores.js';
app.use('/api/proveedores', proveedoresRouter);
import departamentosRouter from './routes/departamentos.js';
app.use('/api/departamentos', departamentosRouter);
import proyectosRouter from './routes/proyectos.js';
app.use('/api/proyectos', proyectosRouter);
app.use('/api/empleados', empleadosRouter);
app.use('/api/licencias', licenciasRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dominios', dominiosRouter);

app.use('/api/tickets', ticketsRouter);
app.use('/api/inventario', inventarioImportExportRoutes);


import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, '../public');

app.get('/licencia/:id', (req, res) => {
  res.sendFile(path.join(publicPath, 'licencia.html'));
});
app.get('/licencias/:id', (req, res) => {
  res.sendFile(path.join(publicPath, 'licencia.html'));
});
app.get('/ordenador/:id', (req, res) => {
  res.sendFile(path.join(publicPath, 'ordenador.html'));
});

app.use(express.static(publicPath));
app.get(['/', '/login', '/login.html'], (req, res) => {
  res.sendFile(path.join(publicPath, 'login.html'));
});

// Middleware para rutas API no encontradas (siempre JSON)

// Middleware para rutas API no encontradas (siempre JSON)
// Debe ir después de todas las rutas API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

