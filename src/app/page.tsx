import { CotizacionesTable } from "@/components/CotizacionesTable";
import { DashboardStats } from "@/components/DashboardStats";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-outfit">Cotizaciones</h2>
          <p className="text-slate-500 mt-1 font-medium">Gestiona y haz seguimiento a todas tus cotizaciones activas</p>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats refreshKey={0} />

      <div className="mt-10">
        <div className="flex items-center gap-x-6 border-b border-slate-100 mb-6">
          <button className="px-1 py-4 text-sm font-bold text-blue-600 border-b-2 border-blue-600">
            Cotizaciones Activas
          </button>
          <button className="px-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Cotizaciones Inactivas
          </button>
        </div>
        
        <CotizacionesTable />
      </div>
    </div>
  );
}
