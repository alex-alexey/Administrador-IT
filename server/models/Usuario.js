import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  nombre: { type: String, required: true },
  departamento: { type: String, default: 'IT' },
  email: { type: String },
  rol: { type: String, default: 'admin' }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Middleware para hashear la contraseña antes de guardar
import bcrypt from 'bcryptjs';
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default Usuario;
