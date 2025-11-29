import mongoose from 'mongoose';

const DepartamentoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true }
});

export default mongoose.model('Departamento', DepartamentoSchema);
