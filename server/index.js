
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
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// Rutas API
app.use('/api/empleados', empleadosRouter);
app.use('/api/licencias', licenciasRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dominios', dominiosRouter);
app.use('/api/ordenador', ordenadorRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intek-it', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Servir archivos estáticos desde public
import path from 'path';
const __dirname = path.resolve();

// Detectar si public está en la raíz o en /server
import fs from 'fs';
let publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  publicPath = path.join(__dirname, '../public');
}
app.get('/licencia/:id', (req, res) => {
  const licenciaPath = path.join(publicPath, 'licencia.html');
  res.sendFile(licenciaPath);
});
// Permitir también /licencias/:id para compatibilidad
app.get('/licencias/:id', (req, res) => {
  const licenciaPath = path.join(publicPath, 'licencia.html');
  res.sendFile(licenciaPath);
});
// Ruta para ordenador
app.get('/ordenador/:id', (req, res) => {
  const ordenadorPath = path.join(publicPath, 'ordenador.html');
  res.sendFile(ordenadorPath);
});
app.use(express.static(publicPath));

// Redirigir /login, /login.html y la raíz / a public/login.html
app.get(['/', '/login', '/login.html'], (req, res) => {
  const loginPath = path.join(publicPath, 'login.html');
  res.sendFile(loginPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

