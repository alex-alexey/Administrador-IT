import mongoose from 'mongoose';
import Proveedor from './models/Proveedor.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
  const existe = await Proveedor.findOne({nombre: 'AELIS'});
  if (!existe) {
    await Proveedor.create({nombre: 'AELIS', contacto: '', activo: true});
    console.log('Proveedor AELIS añadido');
  } else {
    console.log('Proveedor AELIS ya existe');
  }
  mongoose.disconnect();
}
run();
