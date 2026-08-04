"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Clock,
  User,
  Activity,
  FileText,
  Trash2,
  MoreVertical,
  Download,
  Copy
} from "lucide-react";
import { NotificationModal, NotificationType } from "./NotificationModal";
import { cn } from "@/lib/utils";
import { ICotizacion } from "@/models/Cotizacion";
import { Modal } from "@/components/Modal";
import { QuotationForm } from "@/components/QuotationForm";

const statusStyles = {
  draft: "bg-blue-50 text-blue-700 border-blue-100",
  sent: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

const statusLabels = {
  draft: "Generada",
  sent: "En Revisión",
  approved: "Aceptada",
  rejected: "Rechazada",
};

interface CotizacionesTableProps {
  searchTerm?: string;
}

export function CotizacionesTable({ searchTerm = "" }: CotizacionesTableProps) {
  const [cotizaciones, setCotizaciones] = useState<ICotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [selectedCotizacion, setSelectedCotizacion] = useState<ICotizacion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
    confirmAction?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  async function fetchData() {
    setLoading(true);
    try {
      const response = await fetch("/api/cotizaciones");
      const data = await response.json();
      setCotizaciones(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = cotizaciones.filter(c =>
    c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.total.toString().includes(searchTerm)
  );

  const handleEdit = (cotizacion: ICotizacion) => {
    setSelectedCotizacion(cotizacion);
    setIsEditModalOpen(true);
  };

  const handleDuplicate = async (cotizacion: ICotizacion) => {
    try {
      setDuplicatingId(cotizacion._id as unknown as string);
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const fechaHoy = `${year}-${month}-${day}`;

      const duplicatedData = {
        cliente: cotizacion.cliente,
        direccion: cotizacion.direccion || '',
        telefono: cotizacion.telefono || '',
        fecha: fechaHoy,
        cheque: cotizacion.cheque || 'Mario Roberto Gomez Martinez',
        nit: cotizacion.nit || 'N/A',
        pago: cotizacion.pago || 'Contado',
        firmaEmpresa: cotizacion.firmaEmpresa || 'Tec. Ing. Mario Roberto Gómez Martínez',
        comentarios: cotizacion.comentarios || '',
        items: cotizacion.items,
        subTotal: cotizacion.subTotal,
        iva: cotizacion.iva,
        total: cotizacion.total,
        calcularIva: cotizacion.calcularIva !== undefined ? cotizacion.calcularIva : true,
        status: 'draft'
      };

      const response = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedData)
      });

      if (!response.ok) {
        throw new Error('Error al duplicar la cotización');
      }

      await fetchData();

      setNotification({
        isOpen: true,
        type: "success",
        title: "Cotización duplicada",
        message: "Se ha generado una copia idéntica con la fecha de hoy y un nuevo folio.",
      });

    } catch (error) {
      console.error('Error al duplicar la cotización:', error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error al copiar",
        message: "No se pudo duplicar la cotización. Inténtalo de nuevo.",
      });
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDownloadPDF = (cotizacion: ICotizacion) => {
    try {
      setDownloadingId(cotizacion._id as unknown as string);

      let fechaFormateada = "";
      if (cotizacion.fecha) {
        const fecha = new Date(cotizacion.fecha);
        if (!isNaN(fecha.getTime())) {
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          fechaFormateada = `${year}-${month}-${day}`;
        }
      }

      const cotizacionData = {
        cliente: cotizacion.cliente,
        direccion: cotizacion.direccion || '',
        telefono: cotizacion.telefono || '',
        fecha: fechaFormateada,
        cheque: cotizacion.cheque || '',
        nit: cotizacion.nit || '',
        pago: cotizacion.pago || '',
        firmaEmpresa: cotizacion.firmaEmpresa || 'Tec. Ing. Mario Roberto Gómez Martínez',
        comentarios: cotizacion.comentarios || '',
        items: cotizacion.items,
        subTotal: cotizacion.subTotal,
        iva: cotizacion.iva,
        total: cotizacion.total,
        calcularIva: cotizacion.calcularIva || false,
        folio: cotizacion.folio || ''
      };

      const encodedData = encodeURIComponent(JSON.stringify(cotizacionData));

      const iframeId = 'pdf-download-iframe';
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
      }

      iframe.src = `/assets/cotizaciones-standalone.html#data=${encodedData}`;

      setTimeout(() => {
        setDownloadingId(null);
      }, 3000);

    } catch (error) {
      console.error('Error al preparar la descarga del PDF:', error);
      setDownloadingId(null);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error al generar PDF",
        message: "Hubo un problema al crear el archivo PDF. Por favor, intenta de nuevo.",
      });
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cotizaciones/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setCotizaciones((prev) => prev.filter((c) => (c._id as unknown as string) !== id));
      setNotification({
        isOpen: true,
        type: "success",
        title: "Eliminado con éxito",
        message: "La cotización ha sido eliminada.",
      });
    } catch (error) {
      console.error("Error deleting cotizacion:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error al eliminar",
        message: "No se pudo eliminar la cotización correctamente.",
      });
    } finally {
      setNotification({ ...notification, isOpen: false });
    }
  };

  const handleDelete = async (id: string) => {
    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Eliminar cotización",
      message: "¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.",
      confirmAction: () => confirmDelete(id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Folio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-5"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-12"></div></td>
                    <td className="px-6 py-5"></td>
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((cotizacion: ICotizacion) => (
                  <tr key={cotizacion._id as unknown as string} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded" title={cotizacion.folio}>
                        {cotizacion.folio ? `${cotizacion.folio.substring(0, 8)}...` : "S/F"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-x-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{cotizacion.cliente}</p>
                          <p className="text-xs text-slate-500">{cotizacion.telefono || "Sin teléfono"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                      $ {cotizacion.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-x-2 text-xs font-medium text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(cotizacion.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold border",
                        statusStyles[cotizacion.status as keyof typeof statusStyles]
                      )}>
                        {statusLabels[cotizacion.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="flex items-center gap-x-1 text-xs font-medium text-slate-500">
                        <Activity className="h-3.5 w-3.5" />
                        {cotizacion.items.length} items
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-x-2">
                        <button
                          onClick={() => handleDownloadPDF(cotizacion)}
                          disabled={downloadingId === (cotizacion._id as unknown as string)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            downloadingId === (cotizacion._id as unknown as string)
                              ? "text-blue-600 bg-blue-50"
                              : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          )}
                          title="Descargar PDF"
                        >
                          {downloadingId === (cotizacion._id as unknown as string) ? (
                            <div className="h-4 w-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicate(cotizacion)}
                          disabled={duplicatingId === (cotizacion._id as unknown as string)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            duplicatingId === (cotizacion._id as unknown as string)
                              ? "text-blue-600 bg-blue-50"
                              : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          )}
                          title="Copiar cotización"
                        >
                          {duplicatingId === (cotizacion._id as unknown as string) ? (
                            <div className="h-4 w-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(cotizacion)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cotizacion._id as unknown as string)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-y-2">
                      <FileText className="h-12 w-12 text-slate-200" />
                      <p className="text-slate-500 font-medium">No se encontraron cotizaciones</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Cotización"
        maxWidth="2xl"
      >
        <QuotationForm
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchData();
          }}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={selectedCotizacion}
        />
      </Modal>

      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        onConfirm={notification.confirmAction}
      />
    </div>
  );
}
