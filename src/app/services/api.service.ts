import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isActive: boolean;
      companyId?: string;
      roleRef?: any;
      company?: any;
      profileImage?: string;
      is_temporary_password?: boolean;
    };
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  companyId?: string;
}

export interface RegisterResponse {
  status: string;
  data: {
    token: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isActive: boolean;
      companyId?: string;
      roleRef?: any;
      company?: any;
      profileImage?: string;
    };
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  roleId?: string;
  roleRef?: any;
  profileImage?: string;
  phone?: string;
  bio?: string;
  department?: string;
  position?: string;
  address?: string;
  startDate?: string;
  notes?: string;
  companyId?: string;
  company?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UsersListResponse {
  status: string;
  data: UserProfile[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company: string;
  service: string;
  message?: string;
}

export interface ContactResponse {
  status: string;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    company: string;
    service: string;
    createdAt: string;
  };
}

export interface ContactsListResponse {
  status: string;
  data: {
    contacts: Contact[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  service: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;
  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  private userPermissions: string[] = [];

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
    console.log('🔧 ApiService inicializado con baseUrl:', this.baseUrl);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getAuthHeadersForFormData(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ===============================
  // MÉTODOS HTTP BÁSICOS
  // ===============================

  // GET request
  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, {
      headers: this.getAuthHeaders()
    });
  }

  // POST request
  post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // PUT request
  put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // DELETE request
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ===============================
  // MÉTODOS PRINCIPALES
  // ===============================

  // Health Check
  async checkHealth(): Promise<any> {
    try {
      console.log('🔍 Testing API health at:', `${this.baseUrl}/health`);
      
      const response = await this.http.get(`${this.baseUrl}/health`, {
        headers: this.getHeaders()
      }).toPromise();
      
      console.log('✅ Health check response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error en health check:', error);
      console.error('❌ Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        url: error?.url,
        name: error?.name
      });
      throw error;
    }
  }

  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const loginUrl = `${this.baseUrl}/auth/login/`;
    
    try {
      console.log('🔐 Intentando login con:', { 
        email, 
        baseUrl: this.baseUrl,
        loginUrl: loginUrl
      });
      
      const loginData = { email, password };
      console.log('📤 Enviando datos de login:', loginData);
      
      const response = await this.http.post<LoginResponse>(
        loginUrl, 
        loginData,
        { 
          headers: this.getHeaders()
        }
      ).toPromise();

      console.log('📥 Respuesta del servidor:', response);

      const responseBody = response;

      if (responseBody?.status === 'success' && responseBody?.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', responseBody.data.token);
          localStorage.setItem('user', JSON.stringify(responseBody.data.user));
          
          // Actualizar el estado del usuario actual
          this.currentUserSubject.next(responseBody.data.user);
          
          console.log('✅ Login exitoso - Token y usuario guardados');
          console.log('🔐 Token guardado:', responseBody.data.token.substring(0, 20) + '...');
          console.log('👤 Usuario guardado:', responseBody.data.user);
          
          // Cargar permisos del usuario después del login exitoso
          try {
            await this.loadUserPermissions();
          } catch (permError) {
            console.warn('⚠️ Error cargando permisos del usuario:', permError);
          }
        }
      } else {
        console.warn('⚠️ Login sin token en respuesta:', responseBody);
      }

      return responseBody!;
    } catch (error: any) {
      console.error('❌ Error completo en login:', error);
      
      // Detectar si el error es de HTML vs JSON
      if (error?.error && typeof error.error === 'string' && error.error.includes('<!DOCTYPE')) {
        console.error('🚨 PROBLEMA: El servidor está devolviendo HTML en lugar de JSON');
        console.error('🔧 Verificar:');
        console.error('   1. Backend corriendo en puerto 3000: npm run dev');
        console.error('   2. Frontend con proxy: ng serve --proxy-config proxy.conf.local.js');
        console.error('   3. URL del backend:', loginUrl);
        
        throw new Error('Error de conectividad: Backend no disponible o proxy mal configurado');
      }
      
      // Detectar errores de conectividad
      if (error?.status === 0 || error?.name === 'TimeoutError') {
        console.error('🚨 Error de conectividad con el backend');
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }
      
      console.error('❌ Error details completos:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        url: error?.url,
        error: error?.error,
        name: error?.name
      });
      
      throw error;
    }
  }

  // Register - TODO: Implementar cuando se configure el endpoint en el backend
  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    throw new Error('Endpoint de registro no implementado aún en el backend');
  }

  // ===============================
  // MÉTODOS PARA GESTIÓN DE USUARIOS
  // ===============================

  // Listar usuarios con paginación y filtros
  async getUsers(page: number = 1, limit: number = 10, filters: any = {}): Promise<UsersListResponse> {
    try {
      console.log('👥 Obteniendo usuarios:', { page, limit, filters });
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await this.http.get<UsersListResponse>(
        `${this.baseUrl}/users?${queryParams}`,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      console.log('✅ Usuarios obtenidos:', response);
      return response!;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      throw error;
    }
  }

  // Método legacy para compatibilidad
  getUsers_Observable(): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${this.baseUrl}/users`, {
      headers: this.getAuthHeaders()
    });
  }

  // Método legacy async para compatibilidad
  async getUsersAsync(): Promise<UsersListResponse> {
    // Verificar si estamos en un entorno browser
    if (typeof window === 'undefined') {
      console.log('🚫 SSR detectado, devolviendo lista vacía de usuarios');
      return {
        status: 'success',
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }

    try {
      console.log('🔍 Intentando obtener usuarios...');
      
      // Intentar primero sin paginación para login
      const response = await this.http.get<UsersListResponse>(
        `${this.baseUrl}/users`,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      console.log('✅ Usuarios obtenidos correctamente:', response);
      return response!;
    } catch (error: any) {
      console.error('❌ Error obteniendo usuarios (normal en login):', error);
      
      // Devolver estructura vacía pero válida
      return {
        status: 'error',
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  // Obtener usuario específico por ID
  async getUserById(userId: string): Promise<{ status: string; data: UserProfile }> {
    try {
      const response = await this.http.get<{ status: string; data: UserProfile }>(
        `${this.baseUrl}/users/${userId}`,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      return response!;
    } catch (error) {
      console.error('❌ Error obteniendo usuario por ID:', error);
      throw error;
    }
  }

  // Actualizar usuario específico (solo admin)
  async updateUser(userId: string, userData: Partial<UserProfile>): Promise<{ status: string; data: UserProfile }> {
    try {
      console.log('✏️ Actualizando usuario:', { userId, userData });
      
      const response = await this.http.put<{ status: string; data: UserProfile }>(
        `${this.baseUrl}/users/${userId}`,
        userData,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      console.log('✅ Usuario actualizado:', response);
      return response!;
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  async deleteUser(userId: string): Promise<{ status: string; message: string }> {
    try {
      console.log('🗑️ Eliminando usuario:', userId);
      
      const response = await this.http.delete<{ status: string; message: string }>(
        `${this.baseUrl}/users/${userId}`,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      console.log('✅ Usuario eliminado:', response);
      return response!;
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }
  }

  // Crear usuario
  async createUser(user: any): Promise<any> {
    try {
      console.log('👤 Creando usuario:', user);
      
      const response = await this.http.post(`${this.baseUrl}/users/create/`, user, {
        headers: this.getAuthHeaders()
      }).toPromise();

      console.log('✅ Usuario creado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      throw error;
    }
  }

  // Cambiar contraseña temporal
  async changeTemporaryPassword(email: string, temporaryPassword: string, newPassword: string): Promise<any> {
    try {
      console.log('🔐 Cambiando contraseña temporal para:', email);
      
      const response = await this.http.post(`${this.baseUrl}/auth/change-temporary-password`, {
        email,
        temporaryPassword,
        newPassword
      }, {
        headers: this.getHeaders() // Sin autenticación ya que es público
      }).toPromise();

      console.log('✅ Contraseña temporal cambiada:', response);
      return response;
    } catch (error) {
      console.error('❌ Error cambiando contraseña temporal:', error);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS DE PERFIL - Actualizados según documentación backend
  // ===============================

  getCurrentUserProfile(): Observable<{ status: string; data: UserProfile }> {
    console.log('🔍 Obteniendo perfil del usuario actual desde:', `${this.baseUrl}/users/profile/me`);
    return this.http.get<{ status: string; data: UserProfile }>(
      `${this.baseUrl}/users/profile/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  async getCurrentUserProfileAsync(): Promise<{ status: string; data: UserProfile }> {
    try {
      console.log('🔍 Obteniendo perfil async desde:', `${this.baseUrl}/users/profile/me`);
      const response = await this.http.get<{ status: string; data: UserProfile }>(
        `${this.baseUrl}/users/profile/me`,
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      console.log('✅ Perfil obtenido:', response);
      return response!;
    } catch (error: any) {
      console.error('❌ Error obteniendo perfil:', error);
      throw error;
    }
  }

  // Actualizar perfil solo con datos (JSON)
  updateProfile(profileData: Partial<UserProfile>): Observable<{ status: string; data: UserProfile }> {
    console.log('📝 Actualizando perfil con datos:', profileData);
    
    // Limpiar datos antes de enviar
    const cleanData = this.cleanProfileData(profileData);
    
    return this.http.put<{ status: string; data: UserProfile }>(
      `${this.baseUrl}/users/profile/me`,
      cleanData,
      { headers: this.getAuthHeaders() }
    );
  }

  // Actualizar perfil con imagen (FormData)
  updateProfileWithImage(formData: FormData): Observable<{ status: string; data: UserProfile }> {
    console.log('📝 Actualizando perfil con imagen:', formData);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // No incluir Content-Type para FormData - el browser lo configura automáticamente
    });

    return this.http.put<{ status: string; data: UserProfile }>(
      `${this.baseUrl}/users/profile/me`,
      formData,
      { headers }
    );
  }

  // Eliminar imagen de perfil
  deleteProfileImage(): Observable<{ status: string; message: string }> {
    console.log('🗑️ Eliminando imagen de perfil');
    return this.http.delete<{ status: string; message: string }>(
      `${this.baseUrl}/users/profile/me/image`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Helper para construir URL de imagen
  getProfileImageUrl(imagePath: string): string {
    console.log('🔗 getProfileImageUrl() llamado con:', imagePath);
    console.log('🔗 baseUrl:', this.baseUrl);
    
    if (!imagePath) {
      console.log('🔗 Retornando cadena vacía (no hay imagePath)');
      return '';
    }
    
    if (imagePath.startsWith('http')) {
      console.log('🔗 Retornando URL completa:', imagePath);
      return imagePath;
    }
    
    // Si la imagen ya tiene /uploads al inicio, no agregar /uploads nuevamente
    if (imagePath.startsWith('/uploads/')) {
      const fullUrl = `${this.baseUrl.replace('/api', '')}${imagePath}`;
      console.log('🔗 Construyendo URL con /uploads existente:', fullUrl);
      return fullUrl;
    }
    
    // Si no tiene /uploads, agregarlo
    const fullUrl = `${this.baseUrl.replace('/api', '')}/uploads${imagePath}`;
    console.log('🔗 Construyendo URL agregando /uploads:', fullUrl);
    return fullUrl;
  }

  // Cambiar contraseña
  changePassword(passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    console.log('🔒 Cambiando contraseña');
    return this.http.put(
      `${this.baseUrl}/users/password/change`,
      passwordData,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cambiar contraseña de otro usuario (solo administradores)
  changeUserPassword(userId: string, newPassword: string): Observable<any> {
    console.log('🔒 Cambiando contraseña de usuario:', userId);
    return this.http.put(
      `${this.baseUrl}/users/${userId}/password/change`,
      { newPassword },
      { headers: this.getAuthHeaders() }
    );
  }

  // Helper para limpiar datos del perfil
  private cleanProfileData(data: any): any {
    const cleaned: any = {};
    
    // Solo incluir campos permitidos por la API
    const allowedFields = ['firstName', 'lastName', 'department', 'position', 'phone', 'bio'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        cleaned[field] = data[field].toString().trim();
      }
    });
    
    console.log('🧹 Datos limpiados para envío:', cleaned);
    return cleaned;
  }

  // ===============================
  // MÉTODOS PARA DASHBOARD
  // ===============================

  // Listar empresas
  async getCompanies(): Promise<any> {
    try {
      return await this.http.get(`${this.baseUrl}/companies`, {
        headers: this.getAuthHeaders()
      }).toPromise();
    } catch (error) {
      console.error('❌ Error obteniendo empresas:', error);
      throw error;
    }
  }

  // Listar evaluaciones
  async getEvaluations(): Promise<any> {
    try {
      return await this.http.get(`${this.baseUrl}/evaluations`, {
        headers: this.getAuthHeaders()
      }).toPromise();
    } catch (error) {
      console.error('❌ Error obteniendo evaluaciones:', error);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS PARA ROLES
  // ===============================

  // Obtener todos los roles
  async getRoles(): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}/users/roles/public/`, {
        headers: this.getHeaders() // Sin autenticación ya que es público
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error obteniendo roles:', error);
      throw error;
    }
  }

  // Obtener roles por categoría
  async getRolesByCategory(category: string): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}/roles/category/${category}`, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error obteniendo roles por categoría:', error);
      throw error;
    }
  }

  // Asignar rol a usuario
  async assignRole(userId: string, roleId: string): Promise<any> {
    try {
      const response = await this.http.post(`${this.baseUrl}/roles/assign`, 
        { userId, roleId },
        { headers: this.getAuthHeaders() }
      ).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error asignando rol:', error);
      throw error;
    }
  }

  // Obtener estadísticas de roles
  async getRoleStats(): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}/roles/stats`, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de roles:', error);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS DE UTILIDAD Y PERMISOS
  // ===============================

  // Verificar si es super admin
  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'CTO' || user?.role === 'Admin' || user?.role === 'Administrador';
  }

  // Verificar si puede modificar usuarios
  canModifyUsers(): boolean {
    const user = this.getCurrentUser();
    // Solo mrgomez.dev@gmail.com puede modificar usuarios
    return user?.email === 'mrgomez.dev@gmail.com';
  }

  // Verificar si puede ver lista de usuarios
  canViewUsersList(): boolean {
    const user = this.getCurrentUser();
    // Solo mrgomez.dev@gmail.com puede ver la gestión de usuarios
    return user?.email === 'mrgomez.dev@gmail.com';
  }

  // Verificar si puede gestionar candidatos
  canManageCandidates(): boolean {
    const user = this.getCurrentUser();
    console.log('🔍 DEBUG canManageCandidates - Usuario:', user);
    console.log('🔍 DEBUG canManageCandidates - userPermissions:', this.userPermissions);
    
    if (!user) {
      console.log('❌ DEBUG canManageCandidates - No hay usuario');
      return false;
    }
    
    // mrgomez.dev@gmail.com tiene acceso total
    if (user.email === 'mrgomez.dev@gmail.com') {
      console.log('✅ DEBUG canManageCandidates - Usuario mrgomez.dev@gmail.com');
      return true;
    }
    
    // Roles que pueden gestionar candidatos
    const candidateRoles = ['CTO', 'Admin', 'Administrador', 'CEO', 'Recruiter', 'HR'];
    console.log('🔍 DEBUG canManageCandidates - candidateRoles:', candidateRoles);
    console.log('🔍 DEBUG canManageCandidates - user.role:', user.role);
    console.log('🔍 DEBUG canManageCandidates - user.role.rol:', user.role?.rol);
    
    // Verificar si el rol está directamente en user.role o en user.role.rol
    const userRole = user.role?.rol || user.role;
    console.log('🔍 DEBUG canManageCandidates - userRole final:', userRole);
    
    if (userRole && candidateRoles.includes(userRole)) {
      console.log('✅ DEBUG canManageCandidates - Usuario con rol válido:', userRole);
      return true;
    }
    
    // Verificar permisos específicos de candidatos
    const hasViewPermission = this.userPermissions.includes('CANDIDATES_VIEW');
    const hasManagePermission = this.userPermissions.includes('CANDIDATES_MANAGE');
    console.log('🔍 DEBUG canManageCandidates - hasViewPermission:', hasViewPermission);
    console.log('🔍 DEBUG canManageCandidates - hasManagePermission:', hasManagePermission);
    
    const result = hasViewPermission || hasManagePermission;
    console.log('🔍 DEBUG canManageCandidates - Resultado final:', result);
    return result;
  }

  // Verificar si puede modificar roles
  canModifyRoles(): boolean {
    // Bypass temporal: permitir modificar roles a todos los usuarios
    return true;
  }

  // Cargar permisos del usuario autenticado
  async loadUserPermissions(): Promise<void> {
    console.log('🔄 DEBUG loadUserPermissions - Iniciando carga de permisos...');
    try {
      const response = await this.http.get(`${this.baseUrl}/users/my-permissions/`, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('🔄 DEBUG loadUserPermissions - Respuesta del servidor:', response);
      
      if (response && (response as any).status === 'success') {
        this.userPermissions = (response as any).data.permissions || [];
        console.log('✅ Permisos del usuario cargados:', this.userPermissions);
      } else {
        console.warn('⚠️ Respuesta sin formato esperado:', response);
        this.userPermissions = [];
      }
    } catch (error) {
      console.warn('⚠️ Error cargando permisos del usuario:', error);
      this.userPermissions = [];
    }
  }

  // Obtener permisos del usuario autenticado
  async getMyPermissions(): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}/users/my-permissions/`, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      return response;
    } catch (error) {
      console.warn('⚠️ Error obteniendo permisos del usuario:', error);
      throw error;
    }
  }

  // Recargar permisos del usuario (útil después de cambios en gestión de permisos)
  async reloadUserPermissions(): Promise<void> {
    console.log('🔄 Recargando permisos del usuario...');
    await this.loadUserPermissions();
    // Notificar que los permisos han cambiado
    this.currentUserSubject.next(this.getCurrentUser());
  }

  // Verificar si el usuario tiene un permiso específico
  hasPermission(permission: string): boolean {
    // Bypass temporal: todos tienen todos los permisos
    return true;
  }

  // Verificar permisos específicos del sidebar - DEPRECATED
  // Usar PermissionService en su lugar
  canViewCandidates(): boolean {
    console.warn('⚠️ canViewCandidates() está deprecated. Usar PermissionService.');
    return this.hasPermission('CANDIDATES_VIEW');
  }

  canViewUsers(): boolean {
    console.warn('⚠️ canViewUsers() está deprecated. Usar PermissionService.');
    return this.hasPermission('USERS_VIEW') || this.canViewUsersList();
  }

  canViewCRM(): boolean {
    console.warn('⚠️ canViewCRM() está deprecated. Usar PermissionService.');
    return this.hasPermission('CRM_VIEW');
  }

  canViewQuotes(): boolean {
    console.warn('⚠️ canViewQuotes() está deprecated. Usar PermissionService.');
    return this.hasPermission('QUOTES_VIEW');
  }

  canViewEmployees(): boolean {
    console.warn('⚠️ canViewEmployees() está deprecated. Usar PermissionService.');
    return this.hasPermission('EMPLOYEES_VIEW');
  }

  canViewPayroll(): boolean {
    console.warn('⚠️ canViewPayroll() está deprecated. Usar PermissionService.');
    return this.hasPermission('PAYROLL_VIEW');
  }

  canViewClients(): boolean {
    console.warn('⚠️ canViewClients() está deprecated. Usar PermissionService.');
    return this.hasPermission('CLIENTS_VIEW');
  }

  canViewEvaluations(): boolean {
    console.warn('⚠️ canViewEvaluations() está deprecated. Usar PermissionService.');
    return this.hasPermission('EVALUATIONS_VIEW');
  }

  canViewNotifications(): boolean {
    console.warn('⚠️ canViewNotifications() está deprecated. Usar PermissionService.');
    return this.hasPermission('NOTIFICATIONS_VIEW');
  }

  // Verificar si es admin de consultora
  isConsultoraAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'CTO' || user?.role === 'Admin' || user?.role === 'Administrador';
  }

  // Verificar estado de la sesión
  checkSessionStatus(): { isAuthenticated: boolean; token: string | null; user: any | null } {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, token: null, user: null };
    }
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;
    
    try {
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('❌ Error parseando usuario de localStorage:', error);
      localStorage.removeItem('user');
    }
    
    const isAuthenticated = this.isAuthenticated();
    
    console.log('🔍 Estado de sesión:', {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      userRole: user?.role
    });
    
    return { isAuthenticated, token, user };
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false; // SSR safe
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 Verificando autenticación:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      hasUser: !!user,
      userLength: user ? user.length : 0
    });
    
    if (!token || !user) {
      console.log('❌ No hay token o usuario en localStorage');
      return false;
    }
    
    // Verificar que el token no haya expirado
    try {
      const tokenData = this.parseJwt(token);
      const currentTime = Date.now() / 1000;
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        console.log('❌ Token expirado:', {
          exp: new Date(tokenData.exp * 1000),
          current: new Date(currentTime * 1000)
        });
        // Limpiar token expirado
        this.logout();
        return false;
      }
      
      // Verificar que el usuario esté activo
      const userData = JSON.parse(user);
      if (userData.isActive === false) {
        console.log('❌ Usuario inactivo');
        this.logout();
        return false;
      }
      
      console.log('✅ Token válido, usuario autenticado y activo');
      return true;
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return false;
    }
  }

  // Método auxiliar para parsear JWT
  private parseJwt(token: string): any {
    try {
      if (!token || typeof token !== 'string') {
        console.warn('⚠️ Token inválido para parsing:', token);
        return {};
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ Token JWT malformado:', parts.length, 'partes');
        return {};
      }
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      console.log('🔍 Token JWT parseado:', payload);
      return payload;
    } catch (error) {
      console.error('❌ Error parseando JWT:', error);
      return {};
    }
  }

  // Verificar y renovar sesión automáticamente - DESHABILITADO
  async checkAndRefreshSession(): Promise<boolean> {
    // DESHABILITADO: No verificar ni renovar sesión automáticamente
    // La sesión solo se verificará cuando el usuario haga una acción específica
    console.log('🔧 checkAndRefreshSession deshabilitado - no hay verificación automática');
    
    if (typeof window === 'undefined') return false; // SSR safe
    
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Simplemente retornar true si hay token, sin verificar expiración
    console.log('✅ Token presente, sesión considerada válida');
    return true;
    
    /* CÓDIGO ORIGINAL COMENTADO COMPLETAMENTE
    try {
      // Verificar si el token está próximo a expirar (menos de 1 hora)
      const tokenData = this.parseJwt(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = tokenData.exp - currentTime;
      
      // Si el token expira en menos de 1 hora, intentar renovarlo
      if (timeUntilExpiry < 3600) {
        console.log('🔄 Token próximo a expirar, intentando renovar...');
        
        try {
          // Temporalmente deshabilitado para evitar errores de compilación
          console.log('⚠️ Renovación de token temporalmente deshabilitada');
          return timeUntilExpiry > 0; // Retornar true si el token aún es válido
          
          const response: any = await this.http.post(`${this.baseUrl}/auth/refresh-token`, {}, {
            headers: this.getAuthHeaders()
          }).toPromise();
          
          if (response && response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('✅ Token renovado exitosamente');
            return true;
          }
        } catch (error) {
          console.warn('⚠️ No se pudo renovar el token:', error);
          // Si no se puede renovar, verificar si aún es válido
          if (timeUntilExpiry > 0) {
            return true; // El token aún es válido
          } else {
            this.clearAllAuthData();
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      this.clearAllAuthData();
      return false;
    }
    */
  }

  // Obtener usuario actual
  getCurrentUser(): any {
    if (typeof window === 'undefined') return null; // SSR safe
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('🔍 No hay usuario en localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('👤 Usuario actual recuperado:', user);
      console.log('🔍 DEBUG getCurrentUser - Estructura completa del usuario:', JSON.stringify(user, null, 2));
      return user;
    } catch (error) {
      console.error('❌ Error parseando usuario:', error);
      return null;
    }
  }

  // Actualizar usuario actual en localStorage
  updateCurrentUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    if (typeof window === 'undefined') return; // SSR safe
    
    console.log('🚪 Iniciando proceso de logout...');
    
    try {
      // Notificar al backend para invalidar la sesión
      const token = localStorage.getItem('token');
      if (token) {
        console.log('📤 Notificando logout al backend...');
        await this.http.post(`${this.baseUrl}/auth/logout`, {}, {
          headers: this.getAuthHeaders()
        }).toPromise().catch(() => {
          // Ignorar errores si el servidor no está disponible
          console.warn('⚠️ No se pudo notificar al backend del logout');
        });
      }
    } catch (error) {
      console.warn('⚠️ Error notificando logout al backend:', error);
    } finally {
      // Limpiar todos los datos de almacenamiento
      this.clearAllAuthData();
      
      // Limpiar el BehaviorSubject
      this.currentUserSubject.next(null);
      
      console.log('✅ Sesión cerrada completamente');
    }
  }

  // Limpiar todos los datos de autenticación
  private clearAllAuthData(): void {
    if (typeof window === 'undefined') return; // SSR safe
    
    console.log('🧹 Iniciando limpieza de datos de autenticación...');
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('isAuthenticated');
    
    // Limpiar cualquier otra cookie relacionada con la sesión
    this.clearSessionCookies();
    
    console.log('🧹 Todos los datos de autenticación limpiados');
  }

  // Limpiar cookies de sesión
  private clearSessionCookies(): void {
    if (typeof window === 'undefined') return; // SSR safe
    
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Eliminar cookies relacionadas con autenticación
      if (name.includes('token') || name.includes('auth') || name.includes('session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    });
  }

  // ===============================
  // MÉTODO PARA ACCESO AL DASHBOARD BACKEND
  // ===============================

  // Generar token temporal para acceso al dashboard del backend
  async requestBackendDashboardAccess(): Promise<any> {
    try {
      console.log('🚀 Solicitando acceso al dashboard del backend');
      console.log('🔑 Usuario actual:', this.getCurrentUser());
      console.log('🌐 URL de solicitud:', `${this.baseUrl}/auth/backend-dashboard-access`);
      
      const response = await this.http.post(`${this.baseUrl}/auth/backend-dashboard-access`, {}, {
        headers: this.getAuthHeaders()
      }).toPromise();

      console.log('✅ Respuesta del backend:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error solicitando acceso al dashboard backend:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        error: error?.error,
        url: error?.url
      });
      throw error;
    }
  }

  // Verificar si el usuario actual puede acceder al dashboard del backend
  canAccessBackendDashboard(): boolean {
    const user = this.getCurrentUser();
    // COMENTADO: const canAccess = user?.email === 'mrgomez.dev@gmail.com' && user?.role === 'CONSULTORA_ADMIN';
    const canAccess = user?.role === 'CTO' || user?.role === 'Admin' || user?.role === 'Administrador';
    
    console.log('🔐 Verificando acceso al dashboard del backend:', {
      userEmail: user?.email,
      userRole: user?.role,
      canAccess: canAccess
    });
    
    return canAccess;
  }

  // Abrir dashboard del backend en nueva ventana
  async openBackendDashboard(): Promise<void> {
    try {
      const response = await this.requestBackendDashboardAccess();
      
      if (response?.status === 'success' && response?.data?.tempToken) {
        // Usar la URL del backend basada en el baseUrl actual
        const backendUrl = this.baseUrl.replace('/api', '');
        const tempToken = response.data.tempToken;
        
        // Crear URL con token temporal
        const dashboardUrl = `${backendUrl}/login?temp_token=${tempToken}`;
        
        console.log('🔗 Abriendo dashboard del backend:', dashboardUrl);
        console.log('🔑 Token temporal:', tempToken);
        
        // Abrir en nueva ventana
        window.open(dashboardUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        return response.data;
      } else {
        console.error('❌ Respuesta del backend inválida:', response);
        throw new Error('No se pudo generar el token de acceso');
      }
    } catch (error: any) {
      console.error('❌ Error abriendo dashboard del backend:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.status,
        error: error?.error
      });
      throw error;
    }
  }

  // ===============================
  // OPORTUNIDADES
  // ===============================

  async getOpportunities(page: number = 1, limit: number = 10): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return this.http.get(`${this.baseUrl}/candidates/opportunities/?${params}`, { 
      headers: this.getAuthHeaders() 
    }).toPromise();
  }

  async getOpportunityById(id: string): Promise<any> {
    return this.http.get(`${this.baseUrl}/candidates/opportunities/${id}/`, { 
      headers: this.getAuthHeaders() 
    }).toPromise();
  }

  async createOpportunity(data: any): Promise<any> {
    console.log('🚀 ApiService.createOpportunity() iniciado');
    console.log('📋 Datos recibidos:', data);
    
    // Normalización de datos para cumplir con el backend (DRF)
    const toArray = (v: any): string[] => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (!trimmed) return [];
        return trimmed
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
      return [];
    };

    const toNumber = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const cleaned = v.replace(/[^0-9.\-]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
      }
      return null;
    };

    // Preparar datos para envío como JSON (coincidir campos del serializer)
    const opportunityData = {
      title: data.title,
      description: data.description,
      requirements: toArray(data.requirements),
      responsibilities: toArray(data.responsibilities),
      salary_range_min: toNumber(data.salary_range_min ?? data.salary ?? null),
      salary_range_max: toNumber(data.salary_range_max ?? data.salary ?? null),
      location: data.location || 'San Salvador, El Salvador',
      remote_work: Boolean(
        typeof data.remote_work === 'boolean' ? data.remote_work : true
      ),
      contract_type: data.contract_type || 'full_time',
      experience_level: data.experience_level || 'mid',
      skills_required: toArray(data.skills_required),
      benefits: toArray(data.benefits),
      // Importante: el serializer usa isActive (source=is_active)
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    } as any;
    
    console.log('🔄 Datos transformados:', opportunityData);
    console.log('📡 URL:', `${this.baseUrl}/candidates/opportunities/`);
    console.log('📋 Headers:', this.getAuthHeaders());
    
    try {
      const result = await this.http.post(`${this.baseUrl}/candidates/opportunities/`, opportunityData, { 
        headers: this.getAuthHeaders() 
      }).toPromise();
      
      console.log('✅ Respuesta del servidor:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error en createOpportunity:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        error: error.error,
        url: error.url
      });
      throw error;
    }
  }

  async updateOpportunity(id: string, data: any): Promise<any> {
    // Preparar datos para envío como JSON
    const opportunityData: any = {};
    
    // Solo agregar campos que han cambiado
    if (data.title !== undefined) opportunityData.title = data.title;
    if (data.description !== undefined) opportunityData.description = data.description;
    if (data.requirements !== undefined) opportunityData.requirements = data.requirements;
    if (data.salary !== undefined) {
      opportunityData.salary_range_min = parseFloat(data.salary);
      opportunityData.salary_range_max = parseFloat(data.salary);
    }
    if (data.location !== undefined) opportunityData.location = data.location;
    if (data.remote_work !== undefined) opportunityData.remote_work = data.remote_work;
    if (data.contract_type !== undefined) opportunityData.contract_type = data.contract_type;
    if (data.experience_level !== undefined) opportunityData.experience_level = data.experience_level;
    if (data.skills_required !== undefined) opportunityData.skills_required = data.skills_required;
    if (data.benefits !== undefined) opportunityData.benefits = data.benefits;
    if (data.isActive !== undefined) opportunityData.isActive = data.isActive;
    
    return this.http.put(`${this.baseUrl}/candidates/opportunities/${id}/`, opportunityData, { 
      headers: this.getAuthHeaders() 
    }).toPromise();
  }

  async deleteOpportunity(id: string): Promise<any> {
    return this.http.delete(`${this.baseUrl}/candidates/opportunities/${id}/`, { 
      headers: this.getAuthHeaders() 
    }).toPromise();
  }

  async toggleOpportunityActive(id: string): Promise<any> {
    return this.http.patch(`${this.baseUrl}/candidates/opportunities/${id}/toggle-active`, {}, { 
      headers: this.getAuthHeaders() 
    }).toPromise();
  }

  // Búsqueda y filtros avanzados para oportunidades
  async searchOpportunities(filters: {
    search?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
    if (filters.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return this.http.get(`${this.baseUrl}/opportunities?${params}`, { 
      headers: this.getAuthHeaders() 
    }).toPromise();
  }

  // Formatear salario para mostrar
  formatSalary(salary: number | null): string {
    if (!salary) return 'No especificado';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  }

  // Obtener URL de imagen
  getImageUrl(imagePath: string | null): string {
    if (!imagePath) return '';
    
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Las imágenes se sirven desde el backend (puerto 3000)
    // Si estamos en desarrollo, usar localhost:3000, si no, usar la URL base sin /api
    const backendUrl = this.baseUrl.includes('localhost:4200') 
      ? 'http://localhost:3000' 
      : this.baseUrl.replace('/api', '');
    
    // Si la imagen ya tiene /uploads al inicio, no agregar /uploads nuevamente
    if (imagePath.startsWith('/uploads/')) {
      return `${backendUrl}${imagePath}`;
    }
    
    // Si no tiene /uploads, agregarlo
    return `${backendUrl}/uploads/${imagePath}`;
  }

  // ===============================
  // CANDIDATOS POR OPORTUNIDAD
  // ===============================

  async getCandidatesByOpportunity(opportunityId: string): Promise<any> {
    return this.http.get(`${this.baseUrl}/candidates/by-opportunity/${opportunityId}`, { headers: this.getAuthHeaders() }).toPromise();
  }

  async getCandidateOpportunityDetail(candidateId: string, opportunityId: string): Promise<any> {
    return this.http.get(`${this.baseUrl}/candidates/${candidateId}/opportunity/${opportunityId}`, { headers: this.getAuthHeaders() }).toPromise();
  }

  // Aplicar a una oportunidad (landing)
  async applyToOpportunity(opportunityId: string, formData: FormData): Promise<any> {
    try {
      // Evitar errores de parseo cuando el proxy/servidor devuelve texto/HTML
      const resp = await firstValueFrom(this.http.post(`${this.baseUrl}/candidates/apply/${opportunityId}/`,
        formData,
        { responseType: 'text' as const, observe: 'response' as const }
      ));

      if (resp.status >= 200 && resp.status < 300) {
        const contentType = resp.headers.get('Content-Type') || resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            return JSON.parse(resp.body as unknown as string);
          } catch {
            // Si no parsea, retornar envoltura de éxito básica
            return { status: 'success', message: 'Aplicación enviada', raw: resp.body };
          }
        }
        // Si no es JSON, devolver éxito genérico
        return { status: 'success', message: 'Aplicación enviada', raw: resp.body };
      }

      throw new Error(`Error HTTP ${resp.status}`);
    } catch (error: any) {
      // Si el backend devolvió JSON de error como texto, intenta parsearlo
      const maybeText = error?.error;
      if (typeof maybeText === 'string') {
        try {
          const parsed = JSON.parse(maybeText);
          throw parsed;
        } catch {
          // no es JSON, propaga mensaje plano
          throw new Error(maybeText);
        }
      }
      throw error;
    }
  }

  // Enviar invitación
  async generateInvitation(invitation: any): Promise<any> {
    try {
      return await this.http.post(`${this.baseUrl}/invitations/generate`, invitation, {
        headers: this.getAuthHeaders()
      }).toPromise();
    } catch (error) {
      throw error;
    }
  }

  // ===============================
  // MÉTODOS PÚBLICOS (LANDING)
  // ===============================

     // Oportunidades públicas (landing) - Versión con filtros
   async getPublicOpportunities(filters: {
     search?: string;
     salaryMin?: number;
     salaryMax?: number;
     page?: number;
     limit?: number;
   } = {}): Promise<any> {
     // Verificar si estamos en un entorno browser
     if (typeof window === 'undefined') {
       console.log('🚫 SSR detectado, devolviendo lista vacía de oportunidades');
       return {
         status: 'success',
         data: [],
         pagination: {
           page: 1,
           limit: 10,
           total: 0,
           totalPages: 0
         }
       };
     }

     try {
       console.log('🔍 Cargando oportunidades públicas...');
       
       const params = new URLSearchParams();
       
       if (filters.search) params.append('search', filters.search);
       if (filters.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
       if (filters.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
       if (filters.page) params.append('page', filters.page.toString());
       if (filters.limit) params.append('limit', filters.limit.toString());
       
       const response = await this.http.get(`${this.baseUrl}/candidates/opportunities/public/all?${params}`, {
         headers: this.getHeaders()
       }).toPromise();
       
       console.log('✅ Oportunidades públicas cargadas:', response);
       return response;
     } catch (error: any) {
       console.error('❌ Error cargando oportunidades públicas:', error);
       
       // Durante SSR, devolver estructura vacía en lugar de lanzar error
       if (typeof window === 'undefined') {
         return {
           status: 'error',
           data: [],
           pagination: {
             page: 1,
             limit: 10,
             total: 0,
             totalPages: 0
           }
         };
       }
       
       throw error;
     }
   }

  // ===============================
  // CANDIDATOS
  // ===============================

  async getCandidates(page: number = 1, limit: number = 10, filters: any = {}): Promise<any> {
    try {
      let url = `${this.baseUrl}/candidates?page=${page}&limit=${limit}`;
      
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.position) url += `&position=${encodeURIComponent(filters.position)}`;
      if (filters.companyId) url += `&companyId=${filters.companyId}`;
      
      const response = await this.http.get<any>(url, { headers: this.getAuthHeaders() }).toPromise();
      return response;
    } catch (error) {
      console.error('❌ Error al obtener candidatos:', error);
      throw error;
    }
  }

  async getCandidateById(candidateId: string): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.baseUrl}/candidates/${candidateId}`, { headers: this.getAuthHeaders() }).toPromise();
      return response;
    } catch (error) {
      console.error('❌ Error al obtener candidato:', error);
      throw error;
    }
  }

  async downloadLuminaCV(candidateId: string): Promise<Blob> {
    const url = `${this.baseUrl}/candidates/${candidateId}/cv/lumina`;
    return await firstValueFrom(
      this.http.get(url, {
        responseType: 'blob',
        headers: this.getAuthHeaders()
      }) as unknown as Observable<Blob>
    );
  }

  async createCandidate(candidateData: FormData): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.baseUrl}/candidates`, candidateData, { headers: this.getAuthHeadersForFormData() }).toPromise();
      return response;
    } catch (error) {
      console.error('❌ Error al crear candidato:', error);
      throw error;
    }
  }

  async updateCandidate(candidateId: string, candidateData: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.baseUrl}/candidates/${candidateId}`, candidateData, { headers: this.getAuthHeaders() }).toPromise();
      return response;
    } catch (error) {
      console.error('❌ Error al actualizar candidato:', error);
      throw error;
    }
  }

  async deleteCandidate(candidateId: string): Promise<any> {
    try {
      const response = await this.http.delete<any>(`${this.baseUrl}/candidates/${candidateId}/delete/`, { headers: this.getAuthHeaders() }).toPromise();
      return response;
    } catch (error) {
      console.error('❌ Error al eliminar candidato:', error);
      throw error;
    }
  }

  // Questions methods
  getQuestions(): Promise<any> {
    return this.http.get<any>('/api/questions', { headers: this.getAuthHeaders() }).toPromise();
  }

  // Results methods
  getResults(): Promise<any> {
    return this.http.get<any>('/api/results', { headers: this.getAuthHeaders() }).toPromise();
  }

  // Delete company method
  deleteCompany(companyId: string): Promise<any> {
    return this.http.delete<any>(`/api/companies/${companyId}`, { headers: this.getAuthHeaders() }).toPromise();
  }

  // ===============================
  // MÉTODOS DE CONTACTO
  // ===============================

  async submitContactForm(contactData: ContactFormData): Promise<ContactResponse> {
    try {
      console.log('📤 Enviando formulario de contacto:', contactData);
      
      const response = await this.http.post<ContactResponse>(`${this.baseUrl}/contacts`, contactData, {
        headers: this.getHeaders()
      }).toPromise();

      console.log('✅ Formulario de contacto enviado exitosamente:', response);
      return response!;
    } catch (error) {
      console.error('❌ Error al enviar formulario de contacto:', error);
      throw error;
    }
  }

  async getContacts(page: number = 1, limit: number = 10, isRead?: boolean): Promise<ContactsListResponse> {
    try {
      let url = `${this.baseUrl}/contacts?page=${page}&limit=${limit}`;
      if (isRead !== undefined) {
        url += `&isRead=${isRead}`;
      }
      
      const response = await this.http.get<ContactsListResponse>(url, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response!;
    } catch (error) {
      console.error('❌ Error al obtener contactos:', error);
      throw error;
    }
  }

  async markContactAsRead(contactId: string, notes?: string): Promise<{ status: string; message: string; data: Contact }> {
    try {
      const response = await this.http.patch<{ status: string; message: string; data: Contact }>(`${this.baseUrl}/contacts/${contactId}/read`, 
        { notes }, 
        {
          headers: this.getAuthHeaders()
        }).toPromise();

      return response!;
    } catch (error) {
      console.error('❌ Error al marcar contacto como leído:', error);
      throw error;
    }
  }

  async deleteContact(contactId: string): Promise<{ status: string; message: string }> {
    try {
      const response = await this.http.delete<{ status: string; message: string }>(`${this.baseUrl}/contacts/${contactId}`, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response!;
    } catch (error) {
      console.error('❌ Error al eliminar contacto:', error);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS CRM
  // ===============================

  /**
   * Obtener todos los proyectos CRM
   */
  async getCRMProjects(): Promise<any> {
    try {
      console.log('🔍 Obteniendo proyectos CRM...');
      
      const response = await this.http.get(`${this.baseUrl}/crm/projects/`, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Proyectos CRM obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo proyectos CRM:', error);
      throw error;
    }
  }

  /**
   * Obtener un proyecto CRM específico
   */
  async getCRMProject(projectId: string): Promise<any> {
    try {
      console.log('🔍 Obteniendo proyecto CRM:', projectId);
      
      const response = await this.http.get(`${this.baseUrl}/crm/projects/${projectId}/`, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Proyecto CRM obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo proyecto CRM:', error);
      throw error;
    }
  }

  /**
   * Crear un proyecto CRM
   */
  async createCRMProject(projectData: { opportunityId: string; title?: string; description?: string }): Promise<any> {
    try {
      console.log('🔍 Creando proyecto CRM:', projectData);
      
      const response = await this.http.post(`${this.baseUrl}/crm/projects`, projectData, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Proyecto CRM creado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creando proyecto CRM:', error);
      throw error;
    }
  }

  /**
   * Cambiar el estado de un candidato en el CRM
   */
  async changeCandidateStatus(candidateOpportunityId: string, newStatus: string, notes?: string): Promise<any> {
    try {
      console.log('🔍 Cambiando estado del candidato:', { candidateOpportunityId, newStatus, notes });
      
      const response = await this.http.patch(`${this.baseUrl}/crm/candidates/${candidateOpportunityId}/status/`, {
        status: newStatus,
        notes: notes || ''
      }, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Estado del candidato cambiado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error cambiando estado del candidato:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de estados de un candidato
   */
  async getCandidateStatusHistory(candidateOpportunityId: string): Promise<any> {
    try {
      console.log('🔍 Obteniendo historial del candidato:', candidateOpportunityId);
      
      const response = await this.http.get(`${this.baseUrl}/crm/candidates/${candidateOpportunityId}/history/`, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Historial del candidato obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo historial del candidato:', error);
      throw error;
    }
  }

  /**
   * Asignar candidato a proyecto CRM
   */
  async assignCandidateToProject(candidateId: string, opportunityId: string): Promise<any> {
    try {
      console.log('🔍 Asignando candidato al proyecto:', { candidateId, opportunityId });
      
      const response = await this.http.post(`${this.baseUrl}/crm/candidates/assign`, {
        candidateId,
        opportunityId
      }, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Candidato asignado al proyecto:', response);
      return response;
    } catch (error) {
      console.error('❌ Error asignando candidato al proyecto:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del CRM
   */
  async getCRMStatistics(): Promise<any> {
    try {
      console.log('🔍 Obteniendo estadísticas del CRM...');
      
      const response = await this.http.get(`${this.baseUrl}/crm/statistics`, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Estadísticas del CRM obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del CRM:', error);
      throw error;
    }
  }

  /**
   * Eliminar candidato de un proyecto CRM específico
   */
  async removeCandidateFromProject(candidateOpportunityId: string): Promise<any> {
    try {
      console.log('🗑️ Eliminando candidato del proyecto CRM:', candidateOpportunityId);
      
      const response = await this.http.delete(`${this.baseUrl}/crm/candidates/${candidateOpportunityId}`, {
        headers: this.getAuthHeaders()
      }).toPromise();
      
      console.log('✅ Candidato eliminado del proyecto CRM:', response);
      return response;
    } catch (error) {
      console.error('❌ Error eliminando candidato del proyecto CRM:', error);
      throw error;
    }
  }

  // Método de diagnóstico para verificar el estado de la sesión
  debugSessionState(): void {
    if (typeof window === 'undefined') {
      console.log('🚫 No estamos en el browser (SSR)');
      return;
    }
    
    console.log('🔍 === DIAGNÓSTICO DE SESIÓN ===');
    
    // Verificar localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('📦 localStorage:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      hasUser: !!user,
      userLength: user ? user.length : 0
    });
    
    // Verificar sessionStorage
    const sessionToken = sessionStorage.getItem('token');
    const sessionUser = sessionStorage.getItem('user');
    
    console.log('📦 sessionStorage:', {
      hasToken: !!sessionToken,
      hasUser: !!sessionUser
    });
    
    // Verificar cookies
    console.log('🍪 Cookies:', document.cookie);
    
    // Verificar token si existe
    if (token) {
      try {
        const tokenData = this.parseJwt(token);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = tokenData.exp ? tokenData.exp - currentTime : 'N/A';
        
        console.log('🔑 Token info:', {
          exp: tokenData.exp,
          currentTime: currentTime,
          timeUntilExpiry: timeUntilExpiry,
          isValid: tokenData.exp ? tokenData.exp > currentTime : false
        });
      } catch (error) {
        console.error('❌ Error analizando token:', error);
      }
    }
    
    // Verificar usuario si existe
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('👤 User info:', {
          id: userData.id,
          email: userData.email,
          role: userData.role
        });
      } catch (error) {
        console.error('❌ Error analizando usuario:', error);
      }
    }
    
    console.log('🔍 === FIN DIAGNÓSTICO ===');
  }

  // ===============================
  // MÉTODOS DE GESTIÓN DE PERMISOS
  // ===============================

  /**
   * Obtener usuarios con sus permisos
   */
  async getUsersWithPermissions(page: number = 1, limit: number = 10, search?: string): Promise<any> {
    try {
      let url = `${this.baseUrl}/users/permissions-overview?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await this.http.get(url, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo usuarios con permisos:', error);
      throw error;
    }
  }

  /**
   * Obtener permisos específicos de un usuario
   */
  async getUserPermissions(userId: string): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}/users/${userId}/permissions`, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo permisos del usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar múltiples permisos de un usuario
   */
  async updateUserPermissions(userId: string, permissions: any[]): Promise<any> {
    try {
      const response = await this.http.put(`${this.baseUrl}/users/${userId}/permissions`, {
        permissions
      }, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error: any) {
      console.error('❌ Error actualizando permisos del usuario:', error);
      throw error;
    }
  }

  /**
   * Otorgar un permiso específico a un usuario
   */
  async grantUserPermission(userId: string, permission: string, notes?: string, expiresAt?: string): Promise<any> {
    try {
      const response = await this.http.post(`${this.baseUrl}/users/${userId}/permissions`, {
        permission,
        notes,
        expiresAt
      }, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error: any) {
      console.error('❌ Error otorgando permiso:', error);
      throw error;
    }
  }

  /**
   * Revocar un permiso específico de un usuario
   */
  async revokeUserPermission(userId: string, permission: string, notes?: string): Promise<any> {
    try {
      const response = await this.http.delete(`${this.baseUrl}/users/${userId}/permissions/${permission}`, {
        headers: this.getAuthHeaders(),
        body: { notes }
      }).toPromise();

      return response;
    } catch (error: any) {
      console.error('❌ Error revocando permiso:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de permisos
   */
  async getPermissionStats(): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}/users/permissions/stats`, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas de permisos:', error);
      throw error;
    }
  }

  // ===============================
  // NOTIFICACIONES
  // ===============================

  async getNotifications(page: number = 1, limit: number = 10, isRead?: boolean): Promise<any> {
    try {
      let url = `${this.baseUrl}/notifications?page=${page}&limit=${limit}`;
      if (isRead !== undefined) {
        url += `&isRead=${isRead}`;
      }
      
      const response = await this.http.get(url, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      throw error;
    }
  }

  async getUnreadNotificationsCount(): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}/notifications/unread-count`, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error al obtener contador de notificaciones no leídas:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    try {
      const response = await this.http.patch(`${this.baseUrl}/notifications/${notificationId}/read`, {}, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(): Promise<any> {
    try {
      const response = await this.http.patch(`${this.baseUrl}/notifications/mark-all-read`, {}, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<any> {
    try {
      const response = await this.http.delete(`${this.baseUrl}/notifications/${notificationId}/delete/`, {
        headers: this.getAuthHeaders()
      }).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error al eliminar notificación:', error);
      throw error;
    }
  }

  // ===============================
  // PERMISOS DE USUARIO
  // ===============================
} 