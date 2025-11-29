import mongoose from 'mongoose';

const ProveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  contacto: { type: String },
  activo: { type: Boolean, default: true },
  email: { type: String },
  web: { type: String }
});

export default mongoose.model('Proveedor', ProveedorSchema);