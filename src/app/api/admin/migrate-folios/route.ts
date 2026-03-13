import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Cotizacion from '@/models/Cotizacion';

export async function GET() {
  try {
    await connectDB();
    
    const generateFolio = () => {
      const chars = '0123456789abcdef';
      let result = '';
      for (let i = 0; i < 40; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Migrate ALL to the new long hex format as requested
    const cotizaciones = await Cotizacion.find({});

    let updatedCount = 0;

    for (const cot of cotizaciones) {
      let folio = generateFolio();
      let exists = await Cotizacion.findOne({ folio });
      
      while (exists) {
        folio = generateFolio();
        exists = await Cotizacion.findOne({ folio });
      }

      await Cotizacion.findByIdAndUpdate(cot._id, { folio });
      updatedCount++;
    }

    return NextResponse.json({ 
      message: 'Migración completada', 
      processed: cotizaciones.length,
      updated: updatedCount 
    });
  } catch (error: any) {
    console.error('Error in migration:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
