import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Cotizacion from '@/models/Cotizacion';
import Cliente from '@/models/Cliente';

export async function GET() {
  try {
    await connectDB();
    const cotizaciones = await Cotizacion.find({}).sort({ createdAt: -1 });
    console.log('DEBUG: First cotizacion from DB:', JSON.stringify(cotizaciones[0], null, 2));
    return NextResponse.json(cotizaciones);
  } catch (error: any) {
    console.error('Error fetching cotizaciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Generate Long Hex Folio (40 chars)
    const generateFolio = () => {
      const chars = '0123456789abcdef';
      let result = '';
      for (let i = 0; i < 40; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let folio = generateFolio();
    let exists = await Cotizacion.findOne({ folio });
    
    // Simple retry to ensure uniqueness
    while (exists) {
      folio = generateFolio();
      exists = await Cotizacion.findOne({ folio });
    }
    
    body.folio = folio;
    
    // Create the quotation
    const cotizacion = await Cotizacion.create(body);

    // Sync client data
    if (body.cliente) {
      try {
        const clientData = {
          name: body.cliente,
          address: body.direccion || '',
          phone: body.telefono || '',
          nit: body.nit || '',
          is_active: true,
          status: 'active'
        };

        // Upsert client based on name (since we don't have email in quote body yet)
        await Cliente.findOneAndUpdate(
          { name: body.cliente },
          { $set: clientData },
          { upsert: true, new: true }
        );
      } catch (clientError) {
        console.error('Error syncing client:', clientError);
        // We don't fail the whole request if client sync fails
      }
    }

    return NextResponse.json(cotizacion, { status: 201 });
  } catch (error: any) {
    console.error('Error creating cotizacion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
