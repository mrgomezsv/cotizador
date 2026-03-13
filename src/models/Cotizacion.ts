import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICotizacionItem {
  desc: string;
  qty: number;
  unit: number;
  total: number;
}

export interface ICotizacion extends Document {
  cliente: string;
  direccion: string;
  telefono: string;
  fecha: string;
  cheque: string;
  nit: string;
  pago: string;
  firmaEmpresa: string;
  comentarios: string;
  items: ICotizacionItem[];
  subTotal: number;
  iva: number;
  total: number;
  calcularIva: boolean;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  userId?: string | null;
  companyId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const cotizacionItemSchema = new Schema<ICotizacionItem>({
  desc: { type: String, required: true },
  qty: { type: Number, required: true },
  unit: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const cotizacionSchema = new Schema<ICotizacion>({
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
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'approved', 'rejected'],
    default: 'draft'
  },
  userId: { type: String, default: null },
  companyId: { type: String, default: null },
}, { 
  timestamps: true,
  collection: 'cotizacions' // Ensuring we use the existing collection
});

const Cotizacion: Model<ICotizacion> = mongoose.models.Cotizacion || mongoose.model<ICotizacion>('Cotizacion', cotizacionSchema);

export default Cotizacion;
