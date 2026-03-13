"use client";

import { BarChart3, TrendingUp, Download } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="space-y-8 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-outfit">Reportes</h2>
          <p className="text-slate-500 mt-1 font-medium">Analiza el rendimiento de tus cotizaciones y ventas</p>
        </div>
        <button className="flex items-center gap-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="h-4 w-4 text-blue-600" />
          Exportar Datos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-500" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Cargando Gráficos</h4>
          <p className="text-xs text-slate-400 mt-1">Preparando reportes mensuales...</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Tasa de Conversión</h4>
          <p className="text-xs text-slate-400 mt-1">Calculando métricas de aprobación...</p>
        </div>
      </div>
    </div>
  );
}
