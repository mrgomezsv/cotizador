import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CotizacionService, Cotizacion, CotizacionStatusHistory } from '../../services/cotizacion.service';
import { ClientService, CreateClientRequest } from '../../services/client.service';
import { ApiService } from '../../services/api.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.scss'
})
export class CotizacionesComponent implements OnInit {

  private platformId = inject(PLATFORM_ID);
  private cotizacionService = inject(CotizacionService);
  private clientService = inject(ClientService);
  private apiService = inject(ApiService);
  private modalService = inject(ModalService);

  // Lista de cotizaciones guardadas
  cotizaciones: Cotizacion[] = [];
  filteredCotizaciones: Cotizacion[] = [];
  selectedCotizacion: Cotizacion | null = null;
  loading = false;
  error = '';
  totalCotizaciones = 0;
  searchTerm = '';

  // Sistema de estados
  selectedStatusFilter = 'ALL';
  statusHistory: CotizacionStatusHistory[] = [];
  showStatusHistory = false;
  changingStatus = false;

  // Estados disponibles
  readonly availableStatuses = [
    { value: 'GENERADA', label: 'Generada', color: '#3b82f6', bgColor: '#dbeafe' }, // Azul
    { value: 'EN_REVISION', label: 'En Revisión', color: '#f59e0b', bgColor: '#fef3c7' }, // Amarillo/Naranja
    { value: 'ACEPTADA', label: 'Aceptada', color: '#10b981', bgColor: '#d1fae5' }, // Verde
    { value: 'RECHAZADA', label: 'Rechazada', color: '#ef4444', bgColor: '#fee2e2' } // Rojo
  ];

  // Modal de registro de clientes
  showClientModal = false;
  clientForm: CreateClientRequest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    company_name: '',
    status: 'active',
    is_active: true
  };
  clientFormErrors: Record<string, string> = {};
  creatingClient = false;
  showSuccessModal = false;

  // Modal de edición de cotizaciones
  showEditModal = false;
  editingCotizacion: Cotizacion | null = null;
  editForm: Partial<Cotizacion> = {};
  editFormErrors: Record<string, string> = {};
  savingCotizacion = false;

  ngOnInit() {
    // Cargar cotizaciones automáticamente solo en el navegador
    if (isPlatformBrowser(this.platformId as object)) {
      this.loadCotizaciones();
    }
  }

  // Cargar lista de cotizaciones
  loadCotizaciones() {
    // console.log('🚨 [LOAD] Iniciando carga de cotizaciones...');
    // alert('🚨 CARGANDO COTIZACIONES...');

    this.cotizacionService.getAll().subscribe({
      next: (cotizaciones: Cotizacion[]) => {
        // console.log('🚨 [LOAD] Cotizaciones recibidas:', cotizaciones);
        // alert(`🚨 RECIBIDAS ${cotizaciones.length} COTIZACIONES`);

        // Mapear estados del backend a los del frontend y asegurar que el ID esté disponible
        const mapped = cotizaciones.map(c => {
          const cotizacion = c && c.status ? { ...c, status: this.mapBackendStatusToFrontend(c.status) } : c;
          // Asegurar que el ID esté disponible (puede venir como _id del backend)
          if (cotizacion && !cotizacion.id && (cotizacion as any)._id) {
            cotizacion.id = (cotizacion as any)._id;
          }
          return cotizacion;
        });

        this.cotizaciones = mapped;
        this.filteredCotizaciones = mapped;
        this.totalCotizaciones = mapped.length;

        // console.log('🚨 [LOAD] Cotizaciones procesadas:', this.cotizaciones);
        // alert('🚨 COTIZACIONES PROCESADAS');
      },
      error: (error: Error) => {
        console.error('🚨 [LOAD] Error cargando cotizaciones:', error);
        this.modalService.error('Error al cargar cotizaciones', error.message);
      }
    });
  }

  // Filtrar cotizaciones
  filterCotizaciones() {
    if (!this.searchTerm.trim()) {
      this.filteredCotizaciones = this.cotizaciones;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredCotizaciones = this.cotizaciones.filter(cotizacion => {
      // Buscar en todos los campos de la cotización
      const searchableText = [
        cotizacion.id,
        cotizacion.cliente,
        cotizacion.direccion,
        cotizacion.telefono,
        cotizacion.fecha,
        cotizacion.cheque,
        cotizacion.nit,
        cotizacion.pago,
        cotizacion.firmaEmpresa,
        cotizacion.user?.firstName,
        cotizacion.user?.lastName,
        cotizacion.user?.email,
        // Buscar en productos/servicios
        ...cotizacion.items.map(item => item.desc),
        // Buscar en totales
        cotizacion.subTotal.toString(),
        cotizacion.iva.toString(),
        cotizacion.total.toString()
      ].join(' ').toLowerCase();

      return searchableText.includes(searchLower);
    });
  }

  // Limpiar búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.filteredCotizaciones = this.cotizaciones;
  }

  // Verificar si el usuario puede eliminar cotizaciones
  canDeleteCotizacion(): boolean {
    const currentUser = this.apiService.getCurrentUser();
    return currentUser?.email === 'mrgomez.dev@gmail.com';
  }

  // Seleccionar cotización
  selectCotizacion(cotizacion: Cotizacion) {
    // Asegurar que el ID esté disponible (puede venir como _id del backend)
    if (cotizacion && !cotizacion.id && (cotizacion as any)._id) {
      cotizacion.id = (cotizacion as any)._id;
    }
    this.selectedCotizacion = cotizacion;
  }

  // Cerrar detalle de cotización
  closeCotizacionDetail() {
    this.selectedCotizacion = null;
  }

  // Eliminar cotización
  async deleteCotizacion(id: string) {
    const confirmed = await this.modalService.confirm(
      '¿Eliminar cotización?',
      '¿Está seguro de que desea eliminar esta cotización? Esta acción no se puede deshacer.',
      'Eliminar',
      'Cancelar'
    );

    if (confirmed) {
      this.cotizacionService.delete(id).subscribe({
        next: () => {
          this.modalService.success('Cotización eliminada', 'La cotización ha sido eliminada exitosamente');
          this.cotizaciones = this.cotizaciones.filter(c => c.id !== id);
          this.filteredCotizaciones = this.filteredCotizaciones.filter(c => c.id !== id);
          this.totalCotizaciones = this.cotizaciones.length;

          // Si la cotización eliminada era la seleccionada, cerrar el detalle
          if (this.selectedCotizacion?.id === id) {
            this.selectedCotizacion = null;
          }
        },
        error: (error) => {
          console.error('Error al eliminar cotización:', error);
          this.modalService.error('Error al eliminar', 'No se pudo eliminar la cotización. Intente nuevamente.');
        }
      });
    }
  }

  // Descargar PDF de la cotización
  downloadPDF() {
    if (!this.selectedCotizacion) {
      this.modalService.warning('Cotización no seleccionada', 'Por favor seleccione una cotización primero.');
      return;
    }

    try {
      // Asegurar que la fecha esté en el formato correcto (YYYY-MM-DD)
      let fechaFormateada = this.selectedCotizacion.fecha;
      if (fechaFormateada) {
        // Si la fecha viene en formato ISO o Date, convertirla a YYYY-MM-DD
        const fecha = new Date(fechaFormateada);
        if (!isNaN(fecha.getTime())) {
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          fechaFormateada = `${year}-${month}-${day}`;
        }
      }

      // Preparar los datos de la cotización para el generador
      const cotizacionData = {
        cliente: this.selectedCotizacion.cliente,
        direccion: this.selectedCotizacion.direccion || '',
        telefono: this.selectedCotizacion.telefono || '',
        fecha: fechaFormateada,
        cheque: this.selectedCotizacion.cheque || '',
        nit: this.selectedCotizacion.nit || '',
        pago: this.selectedCotizacion.pago || '',
        firmaEmpresa: this.selectedCotizacion.firmaEmpresa || 'Tec. Ing. Mario Roberto Gómez Martínez',
        comentarios: this.selectedCotizacion.comentarios || '',
        items: this.selectedCotizacion.items,
        subTotal: this.selectedCotizacion.subTotal,
        iva: this.selectedCotizacion.iva,
        total: this.selectedCotizacion.total,
        calcularIva: this.selectedCotizacion.calcularIva || false
      };

      console.log('Datos de cotización para PDF:', cotizacionData);

      // Guardar los datos en localStorage para que el generador los use
      localStorage.setItem('cotizacionParaPDF', JSON.stringify(cotizacionData));
      localStorage.setItem('generarPDFAutomaticamente', 'true');

      // Abrir el generador en una nueva ventana y cerrarla inmediatamente
      const win = window as unknown as Window;
      if (win && win.open) {
        const generatorWindow = win.open('/assets/cotizaciones-standalone.html', '_blank', 'width=1,height=1,left=-1000,top=-1000');

        // Cerrar la ventana después de un breve delay para que se genere el PDF
        setTimeout(() => {
          if (generatorWindow && !generatorWindow.closed) {
            generatorWindow.close();
          }
        }, 3000); // 3 segundos para que se genere el PDF
      }
    } catch (error) {
      console.error('Error al preparar la descarga del PDF:', error);
      this.modalService.error('Error al generar PDF', 'No se pudo preparar la descarga del PDF. Intente nuevamente.');
    }
  }

  // Función para formatear fecha
  formatDate(dateString: string): string {
    try {
      console.log(`[FECHA] Fecha recibida: ${dateString}`);

      // Si la fecha es un string con formato MM/DD/YYYY HH:mm:ss (nuevo formato del backend)
      if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        // Crear una nueva fecha manteniendo la zona horaria
        const [datePart, timePart] = dateString.split(' ');
        const [month, day, year] = datePart.split('/').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);

        // Crear fecha usando la zona horaria local
        const date = new Date(year, month - 1, day, hour, minute, second);

        // Formatear para mostrar en español
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };

        // Usar toLocaleDateString
        const result = date.toLocaleDateString('es-ES', options);
        console.log(`[FECHA] Resultado final: ${result}`);
        return result;
      }

      // Si la fecha es un string con formato YYYY-MM-DD HH:mm:ss (formato antiguo)
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        // Crear una nueva fecha manteniendo la zona horaria
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);

        // Crear fecha usando la zona horaria local
        const date = new Date(year, month - 1, day, hour, minute, second);

        // Formatear para mostrar en español
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };

        // Usar toLocaleDateString
        const result = date.toLocaleDateString('es-ES', options);
        console.log(`[FECHA] Resultado final: ${result}`);
        return result;
      }

      // Si es otro formato de fecha, intentar convertirla
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        return date.toLocaleDateString('es-ES', options);
      }

      // Si no es el formato esperado, devolver la fecha original
      console.error('[FECHA] Formato no reconocido:', dateString);
      return dateString;
    } catch (error) {
      console.error('[FECHA] Error formateando fecha:', error);
      return 'Error en fecha'; // Devolver mensaje de error si hay problema
    }
  }

  // Formatear fecha para la lista de cotizaciones
  formatDateForList(dateString: string): string {
    // Usar el mismo método de formateo pero asegurando que se use la zona horaria correcta
    return this.formatDate(dateString);
  }

  // Formatear moneda
  formatCurrency(value: number): string {
    return "$ " + Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Generar Nueva Cotización
  openGenerator() {
    if (isPlatformBrowser(this.platformId as object)) {
      try {
        // Limpiar cualquier dato previo
        localStorage.removeItem('cotizacionParaPDF');
        localStorage.removeItem('generarPDFAutomaticamente');

        const win = window as unknown as Window;
        if (win && win.open) {
          win.open('/assets/cotizaciones-standalone.html', '_blank');
        }
      } catch (error) {
        console.error('Error al abrir el generador:', error);
      }
    }
  }

  // Métodos para el sistema de estados

  // Obtener información del estado
  getStatusInfo(status: string) {
    return this.availableStatuses.find(s => s.value === status) || this.availableStatuses[0];
  }

  // Obtener color del estado para el texto fluorescente
  getStatusColor(status: string): string {
    const statusInfo = this.getStatusInfo(status);
    return statusInfo.color;
  }

  // Obtener color de fondo del estado
  getStatusBgColor(status: string): string {
    const statusInfo = this.getStatusInfo(status);
    return statusInfo.bgColor;
  }

  // Cambiar estado de una cotización
  changeStatus(cotizacion: Cotizacion, newStatus: string) {
    if (!cotizacion.id) return;

    this.changingStatus = true;
    const notes = prompt('Notas sobre el cambio de estado (opcional):');

    this.cotizacionService.changeStatus(cotizacion.id, newStatus, notes || undefined).subscribe({
      next: (updatedCotizacion) => {
        // Mapear estado del backend a frontend
        const mappedUpdated = updatedCotizacion && updatedCotizacion.status
          ? { ...updatedCotizacion, status: this.mapBackendStatusToFrontend(updatedCotizacion.status) }
          : updatedCotizacion;
        // Actualizar la cotización en las listas
        const index = this.cotizaciones.findIndex(c => c.id === cotizacion.id);
        if (index !== -1) {
          this.cotizaciones[index] = mappedUpdated as Cotizacion;
        }

        const filteredIndex = this.filteredCotizaciones.findIndex(c => c.id === cotizacion.id);
        if (filteredIndex !== -1) {
          this.filteredCotizaciones[filteredIndex] = mappedUpdated as Cotizacion;
        }

        // Si es la cotización seleccionada, actualizarla
        if (this.selectedCotizacion?.id === cotizacion.id) {
          this.selectedCotizacion = mappedUpdated as Cotizacion;
        }

        this.changingStatus = false;
        this.modalService.success('Estado actualizado', `El estado ha sido cambiado a: ${this.getStatusInfo(newStatus).label}`);

        // Si el estado es ACEPTADA, mostrar modal de registro de cliente
        if (newStatus === 'ACEPTADA') {
          this.showClientRegistrationModal(updatedCotizacion);
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.changingStatus = false;
        this.modalService.error('Error al cambiar estado', 'No se pudo actualizar el estado de la cotización. Intente nuevamente.');
      }
    });
  }

  // Cargar historial de estados
  loadStatusHistory(cotizacionId: string) {
    this.cotizacionService.getStatusHistory(cotizacionId).subscribe({
      next: (history) => {
        this.statusHistory = history;
        this.showStatusHistory = true;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.modalService.error('Error al cargar historial', 'No se pudo cargar el historial de estados.');
      }
    });
  }

  // Cerrar historial de estados
  closeStatusHistory() {
    this.showStatusHistory = false;
    this.statusHistory = [];
  }

  // Filtrar por estado
  filterByStatus(status: string) {
    this.selectedStatusFilter = status;
    this.loadCotizacionesWithFilters();
  }

  // Cargar cotizaciones con filtros
  loadCotizacionesWithFilters() {
    this.loading = true;
    this.error = '';

    const status = this.selectedStatusFilter === 'ALL' ? undefined : this.selectedStatusFilter;

    this.cotizacionService.getAllWithFilters(status).subscribe({
      next: (response) => {
        const mapped = response.data.map(c => (
          c && c.status ? { ...c, status: this.mapBackendStatusToFrontend(c.status) } : c
        ));
        this.cotizaciones = mapped;
        this.filteredCotizaciones = mapped;
        this.totalCotizaciones = mapped.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cotizaciones con filtros:', error);
        this.error = 'Error al cargar las cotizaciones. Verifique la conexión con el servidor.';
        this.loading = false;
      }
    });
  }

  // Formatear fecha del historial
  formatHistoryDate(dateString: string): string {
    try {
      // Si la fecha es un string con formato MM/DD/YYYY HH:mm:ss (nuevo formato del backend)
      if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        const [datePart, timePart] = dateString.split(' ');
        const [month, day, year] = datePart.split('/').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);

        // Crear fecha usando la zona horaria local
        const date = new Date(year, month - 1, day, hour, minute, second);

        return date.toLocaleString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Para otros formatos de fecha, intentar convertir directamente
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Si no se puede convertir, devolver la fecha original
      return dateString;
    } catch (error) {
      console.error('[FECHA] Error formateando fecha del historial:', error);
      return dateString;
    }
  }

  // Métodos para el modal de registro de clientes

  // Mostrar modal cuando se acepta una cotización
  showClientRegistrationModal(cotizacion: Cotizacion) {
    // Pre-llenar el formulario con datos de la cotización
    this.clientForm = {
      name: cotizacion.cliente || '',
      email: '',
      phone: cotizacion.telefono || '',
      address: cotizacion.direccion || '',
      company_name: cotizacion.nit ? cotizacion.cliente : '',
      status: 'active',
      is_active: true
    };
    this.clientFormErrors = {};
    this.showClientModal = true;
  }

  // Cerrar modal de registro
  closeClientModal() {
    this.showClientModal = false;
    this.clientForm = {
      name: '',
      email: '',
      phone: '',
      address: '',
      company_name: '',
      status: 'active',
      is_active: true
    };
    this.clientFormErrors = {};
  }

  // Validar formulario de cliente
  validateClientForm(): boolean {
    this.clientFormErrors = {};

    if (!this.clientForm.name?.trim()) {
      this.clientFormErrors['name'] = 'El nombre es requerido';
    }

    if (!this.clientForm.email?.trim()) {
      this.clientFormErrors['email'] = 'El email es requerido';
    } else if (!this.isValidEmail(this.clientForm.email)) {
      this.clientFormErrors['email'] = 'El email no es válido';
    }

    return Object.keys(this.clientFormErrors).length === 0;
  }

  // Validar email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Crear cliente
  createClient() {
    if (!this.validateClientForm()) {
      return;
    }

    this.creatingClient = true;

    this.clientService.create(this.clientForm).subscribe({
      next: (client) => {
        console.log('Cliente creado exitosamente:', client);
        this.creatingClient = false;
        this.showClientModal = false;
        this.showSuccessModal = true;
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        this.creatingClient = false;
        this.modalService.error('Error al crear cliente', 'No se pudo crear el cliente. Por favor, intente nuevamente.');
      }
    });
  }

  // Cerrar modal de éxito
  closeSuccessModal() {
    this.showSuccessModal = false;
    // Redirigir a la página de clientes
    window.location.href = '/clients';
  }



  // Mapeo de estados Backend -> Frontend
  private mapBackendStatusToFrontend(backendStatus: string): string {
    const map: Record<string, string> = {
      'draft': 'GENERADA',
      'sent': 'EN_REVISION',
      'approved': 'ACEPTADA',
      'rejected': 'RECHAZADA'
    };
    return map[backendStatus] || backendStatus;
  }

  // Métodos para edición de cotizaciones

  // Abrir modal de edición
  openEditModal(cotizacion: Cotizacion) {
    // Asegurar que el ID esté disponible (puede venir como _id del backend)
    if (cotizacion && !cotizacion.id && (cotizacion as any)._id) {
      cotizacion.id = (cotizacion as any)._id;
    }
    this.editingCotizacion = cotizacion;
    // Crear una copia profunda de la cotización para editar
    this.editForm = {
      cliente: cotizacion.cliente,
      direccion: cotizacion.direccion || '',
      telefono: cotizacion.telefono || '',
      fecha: cotizacion.fecha,
      cheque: cotizacion.cheque || '',
      nit: cotizacion.nit || '',
      pago: cotizacion.pago || '',
      firmaEmpresa: cotizacion.firmaEmpresa,
      comentarios: cotizacion.comentarios || '',
      items: JSON.parse(JSON.stringify(cotizacion.items)), // Copia profunda de items
      subTotal: cotizacion.subTotal,
      iva: cotizacion.iva,
      total: cotizacion.total,
      calcularIva: cotizacion.calcularIva || false
    };
    this.editFormErrors = {};
    this.showEditModal = true;
  }

  // Cerrar modal de edición
  closeEditModal() {
    this.showEditModal = false;
    this.editingCotizacion = null;
    this.editForm = {};
    this.editFormErrors = {};
  }

  // Agregar nuevo item
  addItem() {
    if (!this.editForm.items) {
      this.editForm.items = [];
    }
    this.editForm.items.push({
      desc: '',
      qty: 1,
      unit: 0,
      total: 0
    });
    this.calculateTotals();
  }

  // Eliminar item
  removeItem(index: number) {
    if (this.editForm.items && this.editForm.items.length > 0) {
      this.editForm.items.splice(index, 1);
      this.calculateTotals();
    }
  }

  // Calcular totales cuando cambian los items
  calculateTotals() {
    if (!this.editForm.items) return;

    // Calcular subtotal
    this.editForm.subTotal = this.editForm.items.reduce((sum, item) => {
      const itemTotal = item.qty * item.unit;
      item.total = itemTotal;
      return sum + itemTotal;
    }, 0);

    // Calcular IVA si está habilitado
    if (this.editForm.calcularIva) {
      this.editForm.iva = this.editForm.subTotal * 0.13;
    } else {
      this.editForm.iva = 0;
    }

    // Calcular total
    this.editForm.total = this.editForm.subTotal + (this.editForm.iva || 0);
  }

  // Validar formulario de edición
  validateEditForm(): boolean {
    this.editFormErrors = {};

    if (!this.editForm.cliente?.trim()) {
      this.editFormErrors['cliente'] = 'El nombre del cliente es requerido';
    }

    if (!this.editForm.fecha?.trim()) {
      this.editFormErrors['fecha'] = 'La fecha es requerida';
    }

    if (!this.editForm.firmaEmpresa?.trim()) {
      this.editFormErrors['firmaEmpresa'] = 'La firma de la empresa es requerida';
    }

    if (!this.editForm.items || this.editForm.items.length === 0) {
      this.editFormErrors['items'] = 'Debe agregar al menos un item';
    } else {
      // Validar que todos los items tengan descripción
      const itemsInvalidos = this.editForm.items.some(item => !item.desc?.trim());
      if (itemsInvalidos) {
        this.editFormErrors['items'] = 'Todos los items deben tener una descripción';
      }
    }

    return Object.keys(this.editFormErrors).length === 0;
  }

  // Guardar cambios
  saveCotizacion() {
    console.log('💾 Iniciando guardado de cotización...');
    console.log('📋 Formulario:', this.editForm);
    console.log('🆔 ID de cotización:', this.editingCotizacion?.id);

    if (!this.validateEditForm()) {
      console.error('❌ Validación fallida:', this.editFormErrors);
      return;
    }

    if (!this.editingCotizacion?.id) {
      console.error('❌ No hay ID de cotización');
      this.modalService.error('Error', 'No se pudo identificar la cotización a actualizar.');
      return;
    }

    this.savingCotizacion = true;

    // Preparar datos para enviar
    const updateData: Partial<Cotizacion> = {
      cliente: this.editForm.cliente,
      direccion: this.editForm.direccion || '',
      telefono: this.editForm.telefono || '',
      fecha: this.editForm.fecha,
      cheque: this.editForm.cheque || '',
      nit: this.editForm.nit || '',
      pago: this.editForm.pago || '',
      firmaEmpresa: this.editForm.firmaEmpresa,
      comentarios: this.editForm.comentarios || '',
      items: this.editForm.items,
      subTotal: this.editForm.subTotal || 0,
      iva: this.editForm.iva || 0,
      total: this.editForm.total || 0,
      calcularIva: this.editForm.calcularIva || false
    };

    console.log('📤 Datos a enviar:', updateData);

    this.cotizacionService.update(this.editingCotizacion.id, updateData).subscribe({
      next: (updatedCotizacion) => {
        console.log('✅ Cotización actualizada exitosamente:', updatedCotizacion);

        // Mapear estado del backend a frontend
        const mappedUpdated = updatedCotizacion && updatedCotizacion.status
          ? { ...updatedCotizacion, status: this.mapBackendStatusToFrontend(updatedCotizacion.status) }
          : updatedCotizacion;

        // Actualizar en las listas
        const index = this.cotizaciones.findIndex(c => c.id === this.editingCotizacion?.id);
        if (index !== -1) {
          this.cotizaciones[index] = mappedUpdated as Cotizacion;
        }

        const filteredIndex = this.filteredCotizaciones.findIndex(c => c.id === this.editingCotizacion?.id);
        if (filteredIndex !== -1) {
          this.filteredCotizaciones[filteredIndex] = mappedUpdated as Cotizacion;
        }

        // Si es la cotización seleccionada, actualizarla
        if (this.selectedCotizacion?.id === this.editingCotizacion?.id) {
          this.selectedCotizacion = mappedUpdated as Cotizacion;
        }

        this.savingCotizacion = false;
        this.closeEditModal();
        this.modalService.success('Cotización actualizada', 'Los cambios se han guardado exitosamente');

        // Recargar la lista para asegurar que todo esté actualizado
        this.loadCotizaciones();
      },
      error: (error) => {
        console.error('❌ Error completo al actualizar cotización:', error);
        console.error('❌ Error details:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          error: error?.error,
          url: error?.url
        });

        this.savingCotizacion = false;

        let errorMessage = 'No se pudo actualizar la cotización.';
        if (error?.error?.details) {
          errorMessage += ` ${error.error.details}`;
        } else if (error?.error?.error) {
          errorMessage += ` ${error.error.error}`;
        } else if (error?.message) {
          errorMessage += ` ${error.message}`;
        }

        this.modalService.error('Error al actualizar', errorMessage);
      }
    });
  }
}