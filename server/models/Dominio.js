import mongoose from 'mongoose';

const DominioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  proveedor: { type: String, required: true },
  estado: { type: String, enum: ['Activo', 'Expirado'], default: 'Activo' },
  fechaCompra: { type: Date },
  fechaExpiracion: { type: Date },
}, { timestamps: true });

const Dominio = mongoose.model('Dominio', DominioSchema);
export default Dominio;
