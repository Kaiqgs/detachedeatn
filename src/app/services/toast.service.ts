import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info') {
    const toast: Toast = {
      message,
      type,
      id: this.nextId++
    };
    this.toasts.push(toast);
    this.toastsSubject.next(this.toasts);

    // Auto remove after 3 seconds
    setTimeout(() => this.remove(toast.id), 3000);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next(this.toasts);
  }
} 