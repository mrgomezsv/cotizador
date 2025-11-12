import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface CotizacionItem {
  desc: string;
  qty: number;
  unit: number;
  total: number;
}

export interface CotizacionStatusHistory {
  id: string;
  cotizacionId: string;
  fromStatus?: string;
  toStatus: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Cotizacion {
  id?: string;
  cliente: string;
  direccion?: string;
  telefono?: string;
  fecha: string;
  cheque?: string;
  nit?: string;
  pago?: string;
  firmaEmpresa: string;
  items: CotizacionItem[];
  subTotal: number;
  iva: number;
  total: number;
  calcularIva?: boolean; // Nuevo campo para controlar el cálculo del IVA
  status?: string; // Nuevo campo para el estado
  userId?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  private apiUrl = `${environment.apiUrl}/cotizaciones/`;
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private getAuthHeaders(): HttpHeaders {
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
      console.log('🔑 Token obtenido para cotizaciones:', token ? 'SÍ' : 'NO');
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    console.log('📤 Headers de cotizaciones:', {
      'Content-Type': headers.get('Content-Type'),
      'Accept': headers.get('Accept'),
      'Authorization': headers.get('Authorization') ? 'Bearer [TOKEN]' : 'NO TOKEN'
    });
    
    return headers;
  }

  // Crear una nueva cotización
  create(cotizacion: Omit<Cotizacion, 'id' | 'userId' | 'companyId' | 'createdAt' | 'updatedAt' | 'user' | 'company'>): Observable<Cotizacion> {
    console.log('📝 Creando cotización con headers:', this.getAuthHeaders());
    return this.http.post<Cotizacion>(this.apiUrl, cotizacion, { headers: this.getAuthHeaders() });
  }

  // Obtener todas las cotizaciones del usuario
  getAll(): Observable<Cotizacion[]> {
    console.log('📋 Obteniendo cotizaciones con headers:', this.getAuthHeaders());
    return this.http.get<Cotizacion[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Obtener una cotización específica
  getById(id: string): Observable<Cotizacion> {
    console.log('📄 Obteniendo cotización por ID:', id);
    return this.http.get<Cotizacion>(`${this.apiUrl}${id}`, { headers: this.getAuthHeaders() });
  }

  // Actualizar una cotización
  update(id: string, cotizacion: Partial<Cotizacion>): Observable<Cotizacion> {
    console.log('✏️ Actualizando cotización:', id);
    return this.http.put<Cotizacion>(`${this.apiUrl}${id}`, cotizacion, { headers: this.getAuthHeaders() });
  }

  // Eliminar una cotización
  delete(id: string): Observable<{ message: string }> {
    console.log('🗑️ Eliminando cotización:', id);
    return this.http.delete<{ message: string }>(`${this.apiUrl}${id}`, { headers: this.getAuthHeaders() });
  }

  // Cambiar estado de una cotización
  changeStatus(id: string, status: string, notes?: string): Observable<Cotizacion> {
    console.log('🔄 Cambiando estado de cotización:', id, 'a', status);
    return this.http.patch<Cotizacion>(`${this.apiUrl}${id}/status`, { status, notes }, { headers: this.getAuthHeaders() });
  }

  // Obtener historial de estados de una cotización
  getStatusHistory(id: string): Observable<CotizacionStatusHistory[]> {
    console.log('📊 Obteniendo historial de estados para cotización:', id);
    return this.http.get<CotizacionStatusHistory[]>(`${this.apiUrl}${id}/status-history`, { headers: this.getAuthHeaders() });
  }

  // Obtener cotizaciones con filtros
  getAllWithFilters(status?: string, page = 1, limit = 10): Observable<{ data: Cotizacion[], pagination: Record<string, unknown> }> {
    console.log('🔍 Obteniendo cotizaciones con filtros:', { status, page, limit });
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return this.http.get<{ data: Cotizacion[], pagination: Record<string, unknown> }>(`${this.apiUrl}filtered?${params.toString()}`, { headers: this.getAuthHeaders() });
  }
} 