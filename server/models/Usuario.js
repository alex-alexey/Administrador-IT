import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contrasena: { type: String },
  password: { type: String },
  departamento: { type: String, default: '' },
  fechaAlta: { type: Date, default: Date.now },
  equipoAsignado: { type: String, default: '' },
  pantallaAsignada: { type: String, default: '' },
  rol: { type: String, enum: ['empleado', 'tecnico', 'rrhh', 'adminIT', 'manager', 'admin'], required: true },
  extra: { type: mongoose.Schema.Types.Mixed, default: null }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);


// Middleware para hashear la contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default Usuario;
