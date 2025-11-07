import mongoose from 'mongoose';


const empleadoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  departamento: { type: String },
  correo: { type: String },
  fechaIncorporacion: { type: Date },
  cargo: { type: String },
  estadoLaboral: { type: String },
  licenciasAsignadas: [{ type: String }],
  azureDevOps: { type: String },
  almacenamiento: { type: String },
  sistemaOperativo: { type: String },
  dispositivosAsignados: [{ type: String }],
  asignaciones: [{
    empleado: String,
    departamento: String,
    inicio: Date,
    fin: Date
  }],
  reparaciones: [{
    fecha: Date,
    tecnico: String,
    estado: String,
    problema: String
  }]
});

export default mongoose.model('Empleado', empleadoSchema);