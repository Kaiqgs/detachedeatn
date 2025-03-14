import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      @for (toast of toasts$ | async; track toast.id) {
        <div 
          class="toast show" 
          [ngClass]="getToastClass(toast)"
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true">
          <div class="toast-header">
            <i [class]="getToastIcon(toast)" class="me-2"></i>
            <strong class="me-auto">{{ getToastTitle(toast) }}</strong>
            <button 
              type="button" 
              class="btn-close" 
              aria-label="Close"
              (click)="removeToast(toast.id)">
            </button>
          </div>
          <div class="toast-body">
            {{ toast.message }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      z-index: 1050;
    }
    .toast {
      min-width: 250px;
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toasts$ = this.toastService.toasts$;
  }

  removeToast(id: number) {
    this.toastService.remove(id);
  }

  getToastClass(toast: Toast): string {
    switch (toast.type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'warning': return 'bg-warning';
      default: return 'bg-info text-white';
    }
  }

  getToastIcon(toast: Toast): string {
    switch (toast.type) {
      case 'success': return 'bi bi-check-circle-fill text-white';
      case 'error': return 'bi bi-x-circle-fill text-white';
      case 'warning': return 'bi bi-exclamation-triangle-fill text-dark';
      default: return 'bi bi-info-circle-fill text-white';
    }
  }

  getToastTitle(toast: Toast): string {
    switch (toast.type) {
      case 'success': return 'Sucesso';
      case 'error': return 'Erro';
      case 'warning': return 'Atenção';
      default: return 'Informação';
    }
  }
} 