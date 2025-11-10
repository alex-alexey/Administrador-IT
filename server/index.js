// Backend básico Express + MongoDB (estructura inicial)


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import empleadosRouter from './routes/empleados.js';
import licenciasRouter from './routes/licencias.js';
import inventarioRouter from './routes/inventario.js';
import usuariosRouter from './routes/usuarios.js';
import dashboardRouter from './routes/dashboard.js';
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

// Conexión a MongoDB

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intek-it', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Servir archivos estáticos desde public

import path from 'path';
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../public')));

// Redirigir /login y /login.html a public/login.html
app.get(['/login', '/login.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Redirigir cualquier ruta no encontrada a login.html (opcional, solo si quieres que todo vaya a login)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/login.html'));
// });


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
