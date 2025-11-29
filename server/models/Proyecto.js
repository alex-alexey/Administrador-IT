import mongoose from 'mongoose';

const ProyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true }
});

export default mongoose.model('Proyecto', ProyectoSchema);
