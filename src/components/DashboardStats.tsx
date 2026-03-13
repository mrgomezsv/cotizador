"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsData {
  totalCotizaciones: number;
  pendientesRevision: number;
  montoTotalAprobado: number;
  growth: number;
}

export function DashboardStats({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/cotizaciones/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const cards = [
    {
      title: "TOTAL COTIZACIONES",
      value: stats?.totalCotizaciones || 0,
      icon: FileText,
      color: "blue",
      badge: `${stats?.growth || 0}%`,
      trend: true
    },
    {
      title: "PENDIENTES DE REVISIÓN",
      value: stats?.pendientesRevision || 0,
      icon: Clock,
      color: "amber",
      badge: "Procesando",
      trend: false
    },
    {
      title: "MONTO TOTAL APROBADO",
      value: stats?.montoTotalAprobado 
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.montoTotalAprobado)
        : "$0.00",
      icon: DollarSign,
      color: "emerald",
      badge: "Este mes",
      trend: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {card.title}
              </span>
              <div className={cn(
                "p-2 rounded-xl bg-opacity-10",
                card.color === "blue" && "bg-blue-500 text-blue-600",
                card.color === "amber" && "bg-amber-500 text-amber-600",
                card.color === "emerald" && "bg-emerald-500 text-emerald-600"
              )}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900 font-outfit">
                  {loading ? "..." : card.value}
                </h3>
              </div>
              
              <div className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-x-1",
                card.color === "blue" && "bg-emerald-50 text-emerald-600",
                card.color === "amber" && "bg-amber-50 text-amber-600",
                card.color === "emerald" && "bg-blue-50 text-blue-600"
              )}>
                {card.trend && <TrendingUp className="h-3 w-3" />}
                {card.badge}
              </div>
            </div>
          </div>
          
          {/* Subtle background decoration */}
          <div className={cn(
            "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700",
            card.color === "blue" && "bg-blue-600",
            card.color === "amber" && "bg-amber-600",
            card.color === "emerald" && "bg-emerald-600"
          )} />
        </motion.div>
      ))}
    </div>
  );
}
