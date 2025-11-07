import mongoose from 'mongoose';

const LicenciaSchema = new mongoose.Schema({
  software: { type: String },
  nombreLicencia: { type: String },
  licencia: { type: String },
  usuario: { type: String },
  empleadoAsignado: { type: String },
  departamento: { type: String },
  proveedor: { type: String },
  serialNumber: { type: String },
  costeSinIva: { type: Number },
  fechaAdquisicion: { type: Date },
  fechaUltimaRenovacion: { type: Date },
  tiempoRestanteRenovacion: { type: String },
  fechaRenovacion: { type: Date },
  contratacion: { type: Date },
  expiracion: { type: Date },
  estado: { type: String }
});

const Licencia = mongoose.model('Licencia', LicenciaSchema);
export default Licencia;
