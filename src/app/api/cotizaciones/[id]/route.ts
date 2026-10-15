import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cotizacion from "@/models/Cotizacion";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Cotizacion.findByIdAndDelete(id);
    return NextResponse.json({ message: "Cotización eliminada correctamente" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    const updatedCotizacion = await Cotizacion.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updatedCotizacion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    const updatedCotizacion = await Cotizacion.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updatedCotizacion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

