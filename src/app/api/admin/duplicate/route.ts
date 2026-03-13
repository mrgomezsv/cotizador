
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Cotizacion from '@/models/Cotizacion';
import crypto from 'crypto';

export async function GET() {
  try {
    await connectDB();
    
    const originalFolioPrefix = "fcb797a1";
    const original = await Cotizacion.findOne({ folio: new RegExp('^' + originalFolioPrefix) });
    
    if (!original) {
      return NextResponse.json({ error: "No se encontró la cotización original" }, { status: 404 });
    }
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const newFolio = crypto.randomBytes(20).toString('hex');
    
    const copyData = original.toObject();
    delete copyData._id;
    delete copyData.createdAt;
    delete copyData.updatedAt;
    delete copyData.__v;
    
    copyData.fecha = formattedDate;
    copyData.folio = newFolio;
    copyData.status = 'draft';
    
    const copy = new Cotizacion(copyData);
    await copy.save();
    
    return NextResponse.json({ 
      message: "Copia creada exitosamente", 
      original: original.folio,
      nuevoFolio: newFolio,
      fecha: formattedDate
    });
  } catch (error: any) {
    console.error("Error duplicando cotización:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
