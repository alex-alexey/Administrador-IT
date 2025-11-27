import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  departamento: { type: String, default: '' },
  fechaAlta: { type: Date, default: Date.now },
  equipoAsignado: { type: String, default: '' },
  pantallaAsignada: { type: String, default: '' },
  rol: { type: String, enum: ['empleado', 'tecnico', 'rrhh', 'adminIT', 'manager'], required: true },
  extra: { type: mongoose.Schema.Types.Mixed, default: null }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Middleware para hashear la contraseña antes de guardar

export default Usuario;
