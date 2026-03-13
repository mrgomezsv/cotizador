"use client";

import { ClipboardList, CheckSquare, Plus } from "lucide-react";

export default function TareasPage() {
  return (
    <div className="space-y-8 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-outfit">Tareas</h2>
          <p className="text-slate-500 mt-1 font-medium">Seguimiento de pendientes y recordatorios</p>
        </div>
        <button className="flex items-center gap-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95">
          <Plus className="h-5 w-5" />
          Nueva Tarea
        </button>
      </div>

      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
            <ClipboardList className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-outfit tracking-tight">Lista de Tareas Vacía</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-3 font-medium leading-relaxed">
            Organiza tu flujo de trabajo creando tareas relacionadas con tus cotizaciones y cierres de ventas.
          </p>
          <button className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-x-2">
            <CheckSquare className="h-4 w-4" />
            Crear mi primera tarea
          </button>
        </div>
      </div>
    </div>
  );
}
