"use client";

import React, { useState, FormEvent } from "react";
import { User, Mail, Phone, MapPin, Building, Save } from "lucide-react";

interface ClientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function ClientForm({ onSuccess, onCancel, initialData }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    company_name: initialData?.company_name || "",
    nit: initialData?.nit || "",
    status: initialData?.status || "active",
    is_active: initialData?.is_active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/clientes", {
        method: initialData ? "PUT" : "POST",
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
      console.error("Error saving client:", error);
      alert("Error al guardar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-x-2">
            <User className="h-4 w-4 text-slate-400" />
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            placeholder="John Doe"
            className={`w-full px-4 py-2.5 bg-slate-50 border ${
              errors.name ? "border-rose-500" : "border-slate-200"
            } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-x-2">
            <Mail className="h-4 w-4 text-slate-400" />
            Email *
          </label>
          <input
            type="email"
            required
            placeholder="john@example.com"
            className={`w-full px-4 py-2.5 bg-slate-50 border ${
              errors.email ? "border-rose-500" : "border-slate-200"
            } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-x-2">
            <Building className="h-4 w-4 text-slate-400" />
            Empresa
          </label>
          <input
            type="text"
            placeholder="Nombre de la empresa"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.company_name}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-x-2">
            <Phone className="h-4 w-4 text-slate-400" />
            Teléfono
          </label>
          <input
            type="text"
            placeholder="7123-4567"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>

        {/* NIT */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-x-2">
            <Building className="h-4 w-4 text-slate-400" />
            NIT
          </label>
          <input
            type="text"
            placeholder="0000-000000-000-0"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.nit}
            onChange={(e) => handleInputChange("nit", e.target.value)}
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-x-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            Dirección
          </label>
          <textarea
            placeholder="San Salvador, El Salvador"
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
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
          ) : (
            <Save className="h-4 w-4" />
          )}
          {initialData ? "Actualizar Cliente" : "Guardar Cliente"}
        </button>
      </div>
    </form>
  );
}
