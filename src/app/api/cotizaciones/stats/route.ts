import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cotizacion from "@/models/Cotizacion";

export async function GET() {
  try {
    await connectDB();

    // Total quotations
    const totalCount = await Cotizacion.countDocuments();

    // Pending review (draft and sent)
    const pendingCount = await Cotizacion.countDocuments({
      status: { $in: ["draft", "sent"] }
    });

    // Total approved amount
    const approvedStats = await Cotizacion.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalAmount: { $sum: "$total" } } }
    ]);

    const totalApprovedAmount = approvedStats.length > 0 ? approvedStats[0].totalAmount : 0;

    // Monthly growth (mock for now or calculate based on date)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const prevMonthStats = await Cotizacion.countDocuments({
      createdAt: { $lt: startOfMonth }
    });

    const growth = prevMonthStats > 0 
      ? Math.round(((totalCount - prevMonthStats) / prevMonthStats) * 100) 
      : 100;

    return NextResponse.json({
      totalCotizaciones: totalCount,
      pendientesRevision: pendingCount,
      montoTotalAprobado: totalApprovedAmount,
      growth: growth
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
