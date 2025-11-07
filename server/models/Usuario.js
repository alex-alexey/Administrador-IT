import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: { type: String, required: true },
  departamento: { type: String, default: 'IT' },
  email: { type: String },
  rol: { type: String, default: 'admin' }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);
export default Usuario;
