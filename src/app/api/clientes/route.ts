import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cliente from "@/models/Cliente";

export async function GET() {
  try {
    await connectDB();
    const clientes = await Cliente.find({}).sort({ createdAt: -1 });
    return NextResponse.json(clientes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const newCliente = await Cliente.create(data);
    return NextResponse.json(newCliente, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
