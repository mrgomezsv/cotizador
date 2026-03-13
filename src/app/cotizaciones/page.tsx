"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { CotizacionesTable } from "@/components/CotizacionesTable";
import { Modal } from "@/components/Modal";
import { QuotationForm } from "@/components/QuotationForm";
import { DashboardStats } from "@/components/DashboardStats";

export default function CotizacionesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey((prev: number) => prev + 1);
  };

  return (
    <div className="space-y-8 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-outfit">Cotizaciones</h2>
          <p className="text-slate-500 mt-1 font-medium">Gestiona y crea nuevas cotizaciones para tus clientes</p>
        </div>
      </div>
      
      <DashboardStats refreshKey={refreshKey} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cotización..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Nueva Cotización
        </button>
      </div>

      <CotizacionesTable key={refreshKey} searchTerm={searchTerm} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nueva Cotización"
        maxWidth="2xl"
      >
        <QuotationForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
