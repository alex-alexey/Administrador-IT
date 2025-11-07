import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Usuario from './models/Usuario.js';

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intek-it', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Verificar si el usuario admin ya existe
  const existe = await Usuario.findOne({ username: 'admin' });
  if (!existe) {
    await Usuario.create({
      username: 'admin',
      password: 'admin',
      nombre: 'Administrador',
      departamento: 'IT',
      email: 'admin@intek.com',
      rol: 'admin'
    });
    console.log('Usuario admin creado');
  } else {
    console.log('El usuario admin ya existe');
  }
  mongoose.disconnect();
}

main();
