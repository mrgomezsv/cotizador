import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}

export interface ModalState {
  show: boolean;
  config: ModalConfig | null;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalState = new BehaviorSubject<ModalState>({
    show: false,
    config: null
  });

  public modalState$ = this.modalState.asObservable();

  /**
   * Mostrar modal de éxito
   */
  success(title: string, message: string): void {
    this.showModal({
      title,
      message,
      type: 'success',
      confirmText: 'Entendido',
      icon: 'fa-check-circle'
    });
  }

  /**
   * Mostrar modal de error
   */
  error(title: string, message: string): void {
    this.showModal({
      title,
      message,
      type: 'error',
      confirmText: 'Cerrar',
      icon: 'fa-times-circle'
    });
  }

  /**
   * Mostrar modal de advertencia
   */
  warning(title: string, message: string): void {
    this.showModal({
      title,
      message,
      type: 'warning',
      confirmText: 'Entendido',
      icon: 'fa-exclamation-triangle'
    });
  }

  /**
   * Mostrar modal de información
   */
  info(title: string, message: string): void {
    this.showModal({
      title,
      message,
      type: 'info',
      confirmText: 'Entendido',
      icon: 'fa-info-circle'
    });
  }

  /**
   * Mostrar modal de confirmación que retorna una promesa
   */
  confirm(title: string, message: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalState.next({
        show: true,
        config: {
          title,
          message,
          type: 'confirm',
          confirmText,
          cancelText,
          icon: 'fa-question-circle'
        },
        resolve
      });
    });
  }

  /**
   * Mostrar modal personalizado
   */
  private showModal(config: ModalConfig): void {
    this.modalState.next({
      show: true,
      config
    });
  }

  /**
   * Cerrar modal y resolver promesa si existe
   */
  close(confirmed: boolean = false): void {
    const currentState = this.modalState.value;
    
    if (currentState.resolve) {
      currentState.resolve(confirmed);
    }

    this.modalState.next({
      show: false,
      config: null
    });
  }
}

