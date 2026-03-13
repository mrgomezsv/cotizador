"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, User, FileText, DollarSign, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICliente } from "@/models/Cliente";

interface Item {
  desc: string;
  qty: number;
  unit: number;
  total: number;
}

interface QuotationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function QuotationForm({ onSuccess, onCancel, initialData }: QuotationFormProps) {
  const [formData, setFormData] = useState({
    cliente: initialData?.cliente || "",
    direccion: initialData?.direccion || "",
    telefono: initialData?.telefono || "",
    fecha: initialData?.fecha || new Date().toISOString().split("T")[0],
    firmaEmpresa: initialData?.firmaEmpresa || "Licda. Carmen Concepcion Hernandez",
    cheque: initialData?.cheque || "",
    nit: initialData?.nit || "",
    pago: initialData?.pago || "",
    comentarios: initialData?.comentarios || "",
    items: initialData?.items || [{ desc: "", qty: 1, unit: 0, total: 0 }],
    subTotal: initialData?.subTotal || 0,
    iva: initialData?.iva || 0,
    total: initialData?.total || 0,
    calcularIva: initialData?.calcularIva || false,
    status: initialData?.status || "draft",
  });

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ICliente[]>([]);
  const [showClientSelector, setShowClientSelector] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clientes");
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  const selectClient = (client: ICliente) => {
    setFormData({
      ...formData,
      cliente: client.name,
      direccion: client.address || "",
      telefono: client.phone || "",
      nit: client.nit || formData.nit, // Added nit to ICliente if it exists or keep existing
    });
    setShowClientSelector(false);
  };

  const calculateTotals = (items: Item[], calcIva: boolean) => {
    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.unit), 0);
    const iva = calcIva ? subTotal * 0.13 : 0;
    const total = subTotal + iva;
    return { subTotal, iva, total };
  };

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    if (field === "calcularIva") {
      const { subTotal, iva, total } = calculateTotals(newFormData.items, value);
      newFormData.subTotal = subTotal;
      newFormData.iva = iva;
      newFormData.total = total;
    }
    setFormData(newFormData);
  };

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "qty" || field === "unit") {
      newItems[index].total = newItems[index].qty * newItems[index].unit;
    }

    const { subTotal, iva, total } = calculateTotals(newItems, formData.calcularIva);
    setFormData({ ...formData, items: newItems, subTotal, iva, total });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { desc: "", qty: 1, unit: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_: Item, i: number) => i !== index);
    const { subTotal, iva, total } = calculateTotals(newItems, formData.calcularIva);
    setFormData({ ...formData, items: newItems, subTotal, iva, total });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert("Error: " + error.error);
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert("Error al guardar la cotización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Client Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-x-2">
          <User className="h-4 w-4" />
          Información del Cliente
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-slate-700">Cliente *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Nombre del cliente"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                value={formData.cliente}
                onChange={(e) => handleInputChange("cliente", e.target.value)}
                onFocus={() => setShowClientSelector(true)}
              />
              <button 
                type="button"
                onClick={() => setShowClientSelector(!showClientSelector)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", showClientSelector && "rotate-180")} />
              </button>
            </div>

            {/* Client Selector Dropdown */}
            {showClientSelector && clients.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto scrollbar-hide py-2 animate-in fade-in slide-in-from-top-2">
                {clients
                  .filter((c: ICliente) => c.name.toLowerCase().includes(formData.cliente.toLowerCase()))
                  .map((client: ICliente) => (
                    <button
                      key={client._id as unknown as string}
                      type="button"
                      onClick={() => selectClient(client)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex flex-col transition-colors border-b border-slate-50 last:border-0"
                    >
                      <span className="font-bold text-slate-800">{client.name}</span>
                      {client.company_name && (
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{client.company_name}</span>
                      )}
                    </button>
                  ))}
                {clients.filter((c: ICliente) => c.name.toLowerCase().includes(formData.cliente.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-400 font-medium">
                    No se encontraron clientes existentes
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Fecha *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.fecha}
              onChange={(e) => handleInputChange("fecha", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Dirección</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Teléfono</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-x-2">
            <FileText className="h-4 w-4" />
            Productos / Servicios
          </h4>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-x-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item: Item, index: number) => (
            <div key={index} className="flex gap-x-3 items-start group">
              <div className="flex-1">
                <input
                  placeholder="Descripción"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={item.desc}
                  onChange={(e) => handleItemChange(index, "desc", e.target.value)}
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  placeholder="Cant"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Precio"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, "unit", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="w-32 py-2.5 px-2 text-right text-sm font-bold text-slate-700">
                $ {item.total.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-x-2">
            <DollarSign className="h-4 w-4" />
            Pago y Otros
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">NIT</label>
              <input
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.nit}
                onChange={(e) => handleInputChange("nit", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Forma de Pago</label>
              <input
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.pago}
                onChange={(e) => handleInputChange("pago", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-x-2">
              <input
                type="checkbox"
                id="calcIva"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={formData.calcularIva}
                onChange={(e) => handleInputChange("calcularIva", e.target.checked)}
              />
              <label htmlFor="calcIva" className="text-sm font-bold text-slate-600">
                Calcular IVA (13%)
              </label>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between text-sm font-medium text-slate-500">
            <span>Subtotal</span>
            <span>$ {formData.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-500">
            <span>IVA (13%)</span>
            <span>$ {formData.iva.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-base font-bold text-slate-900 font-outfit">Total de Cotización</span>
            <span className="text-2xl font-bold text-blue-600 font-outfit">$ {formData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-4 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 flex items-center gap-x-2"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : null}
          Guardar Cotización
        </button>
      </div>
    </form>
  );
}
