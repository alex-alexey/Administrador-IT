import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  asunto: { type: String, required: true },
  usuario: { type: String, required: true },
  prioridad: { type: String, enum: ['Alta', 'Media', 'Baja'], required: true },
  estado: { type: String, enum: ['Abierto', 'Cerrado'], required: true },
  fecha: { type: Date, required: true }
});

const Ticket = mongoose.model('Ticket', TicketSchema);
export default Ticket;
