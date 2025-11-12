import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  contact_person?: string;
  position?: string;
  notes?: string;
  status: string;
  source?: string;
  assigned_to?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  contacts?: any[];
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  contact_person?: string;
  position?: string;
  notes?: string;
  status?: string;
  source?: string;
  is_active?: boolean;
}

export interface ClientsApiResponse {
  status: string;
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ClientApiResponse {
  status: string;
  message: string;
  data: Client;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los clientes
  getAll(): Observable<Client[]> {
    return this.http.get<ClientsApiResponse>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  // Obtener un cliente por ID
  getById(id: string): Observable<Client> {
    return this.http.get<ClientApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  // Crear un nuevo cliente
  create(clientData: CreateClientRequest): Observable<Client> {
    return this.http.post<ClientApiResponse>(this.apiUrl, clientData, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  // Actualizar un cliente
  update(id: string, clientData: Partial<CreateClientRequest>): Observable<Client> {
    return this.http.put<ClientApiResponse>(`${this.apiUrl}/${id}`, clientData, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  // Eliminar un cliente
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Buscar clientes por término
  search(term: string): Observable<Client[]> {
    return this.http.get<ClientsApiResponse>(`${this.apiUrl}/search/?q=${encodeURIComponent(term)}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data)
      );
  }
} 