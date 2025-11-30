import mongoose from 'mongoose';


const GastoSchema = new mongoose.Schema({
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  monto: { type: Number, required: true },
  categoria: { type: String },
  fecha: { type: Date, required: true },
  numeroFactura: { type: String },
  // Asignación
  empleadoSolicitante: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado' },
  empleadoResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado' },
  departamento: { type: String },
  proyecto: { type: String },
  estadoAprobacion: { type: String, enum: ['pendiente', 'aprobado', 'rechazado'], default: 'pendiente' },
  // Renovación
  fechaExpiracion: { type: Date },
  diasRestantes: { type: Number },
  estadoRenovacion: { type: String, enum: ['activo', 'próximo a vencer', 'vencido'], default: 'activo' },
  periodicidad: { type: String },
  importeRenovacion: { type: Number },
  notasRenovacion: { type: String }
});

export default mongoose.model('Gasto', GastoSchema);