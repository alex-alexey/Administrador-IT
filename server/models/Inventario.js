import mongoose from 'mongoose';

const InventarioSchema = new mongoose.Schema({
  tipo: { type: String },
  trazaEquipo: { type: String },
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  marca: { type: String },
  modelo: { type: String },
  serie: { type: String },
  estado: { 
    type: String, 
    enum: ['Operativo', 'En reparación', 'Baja'],
    default: 'Operativo'
  },
  ubicacion: { type: String },
  responsable: { type: String },
  empleado: { type: String },
  fechaCompra: { type: Date },
  observaciones: { type: String },
  cpu: { type: String },
  ram: { type: String },
  storage: { type: String },
  os: { type: String },
  asignaciones: [{
    empleado: { type: String },
    departamento: { type: String },
    inicio: { type: Date },
    fin: { type: Date }
  }],
  reparaciones: [{
    fecha: { type: Date },
    problema: { type: String },
    tecnico: { type: String },
    estado: { type: String }
  }]
});

const Inventario = mongoose.model('Inventario', InventarioSchema);
export default Inventario;
