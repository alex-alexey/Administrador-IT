import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  asunto: { type: String, required: true },
  usuario: { type: String, required: true },
  prioridad: { type: String, enum: ['Alta', 'Media', 'Baja', 'Urgente'], required: true },
  estado: { type: String, enum: ['Abierto', 'Cerrado', 'Enproceso'], required: true },
  fecha: { type: Date, required: true },
  tipo: { type: String, required: true },
  descripcion: { type: String }
});

const Ticket = mongoose.model('Ticket', TicketSchema);
export default Ticket;
