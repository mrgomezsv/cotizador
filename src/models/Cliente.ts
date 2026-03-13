import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICliente extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company_name?: string;
  nit?: string;
  is_active: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClienteSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    company_name: { type: String },
    nit: { type: String },
    is_active: { type: Boolean, default: true },
    status: { type: String, default: "active" },
  },
  {
    timestamps: true,
    collection: "clientes",
  }
);

// Prevent model overwrite in development (HMR)
const Cliente: Model<ICliente> =
  mongoose.models.Cliente || mongoose.model<ICliente>("Cliente", ClienteSchema);

export default Cliente;
