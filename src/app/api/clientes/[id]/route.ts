import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cliente from "@/models/Cliente";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Cliente.findByIdAndDelete(id);
    return NextResponse.json({ message: "Cliente eliminado correctamente" });
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
    const updatedCliente = await Cliente.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updatedCliente);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
