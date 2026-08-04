const mongoose = require('mongoose');

const cotizacionItemSchema = new mongoose.Schema({
  desc: { type: String, required: true },
  qty: { type: Number, required: true },
  unit: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const cotizacionSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  direccion: { type: String, default: '' },
  telefono: { type: String, default: '' },
  fecha: { type: String, required: true },
  cheque: { type: String, default: '' },
  nit: { type: String, default: '' },
  pago: { type: String, default: '' },
  firmaEmpresa: { type: String, required: true },
  comentarios: { type: String, default: '' },
  items: [cotizacionItemSchema],
  subTotal: { type: Number, required: true },
  iva: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  calcularIva: { type: Boolean, default: false },
  folio: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'approved', 'rejected'],
    default: 'draft'
  },
  userId: { type: String, default: null },
  companyId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Actualizar updatedAt antes de guardar
cotizacionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para formatear la fecha
cotizacionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.createdAt) {
    obj.createdAt = new Date(obj.createdAt).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  if (obj.updatedAt) {
    obj.updatedAt = new Date(obj.updatedAt).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  return obj;
};

module.exports = mongoose.model('Cotizacion', cotizacionSchema, 'cotizacions');

