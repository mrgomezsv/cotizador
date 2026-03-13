"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  PieChart, 
  PlusCircle,
  HelpCircle,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cotizaciones", href: "/cotizaciones", icon: FileText },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Reportes", href: "/reportes", icon: PieChart },
  { name: "Tareas", href: "/tareas", icon: ClipboardList },
];

const secondaryNavigation = [
  { name: "Ayuda", href: "/ayuda", icon: HelpCircle },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-slate-100 shadow-sm">
      <div className="flex h-16 shrink-0 items-center gap-x-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
          Z
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Mi Factura DTE</span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-slate-50 text-blue-600 border-r-4 border-blue-600"
                        : "text-slate-500 hover:text-blue-600 hover:bg-slate-50",
                      "group flex gap-x-3 p-3 text-sm font-semibold transition-all duration-200"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wider">
              Soporte & Ajustes
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-slate-50 text-blue-600"
                        : "text-slate-500 hover:text-blue-600 hover:bg-slate-50",
                      "group flex gap-x-3 p-3 text-sm font-semibold transition-all duration-200"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto -mx-2">
            <Link
              href="/logout"
              className="group flex gap-x-3 p-3 text-sm font-semibold leading-6 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-rose-600" aria-hidden="true" />
              Cerrar Sesión
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
