import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealDbService } from '../../services/meal-db.service';
import { ToastService } from '../../services/toast.service';

interface ImportError {
  message: string;
}

interface MealData {
  id?: number;
  description: string;
  place: string;
  emotion: string;
  datetime: Date;
}

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Main Import/Export Modal -->
    <div class="modal fade" [class.show]="isVisible && !showDuplicateModal" [style.display]="isVisible && !showDuplicateModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Importar/Exportar Refeições</h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body">
            <!-- Date Range Selection -->
            <div class="mb-3">
              <label class="form-label">Período para Exportação</label>
              <div class="row g-2">
                <div class="col-12 col-sm-6">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">De</span>
                    <input 
                      type="date" 
                      class="form-control" 
                      [(ngModel)]="startDate"
                      (ngModelChange)="onDateChange()">
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">Até</span>
                    <input 
                      type="date" 
                      class="form-control" 
                      [(ngModel)]="endDate"
                      (ngModelChange)="onDateChange()">
                  </div>
                </div>
              </div>
            </div>

            <!-- JSON Data -->
            <div class="mb-3">
              <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-2">
                <label class="form-label mb-0">Dados JSON</label>
                <div class="btn-group btn-group-sm">
                  <button 
                    class="btn btn-outline-secondary" 
                    (click)="pasteFromClipboard()"
                    title="Colar da Área de Transferência">
                    <i class="bi bi-clipboard me-1"></i>Colar
                  </button>
                  <button 
                    class="btn btn-outline-secondary" 
                    (click)="copyToClipboard()"
                    title="Copiar para Área de Transferência">
                    <i class="bi bi-clipboard-check me-1"></i>Copiar
                  </button>
                </div>
              </div>
              <textarea 
                #jsonTextarea
                class="form-control form-control-sm" 
                rows="10" 
                [(ngModel)]="jsonData"
                placeholder="Cole aqui os dados JSON para importar ou veja os dados exportados"></textarea>
            </div>
          </div>
          <div class="modal-footer flex-column flex-sm-row gap-2 gap-sm-0">
            <button type="button" class="btn btn-secondary btn-sm order-3 order-sm-1 w-100 w-sm-auto" (click)="close()">Fechar</button>
            <div class="btn-group btn-group-sm order-1 order-sm-2 w-100 w-sm-auto">
              <button type="button" class="btn btn-primary" (click)="importData()">
                <i class="bi bi-download me-1"></i>Importar
              </button>
              <button type="button" class="btn btn-success" (click)="exportData()">
                <i class="bi bi-upload me-1"></i>Exportar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Duplicate Confirmation Modal (Sibling, not nested) -->
    <div class="modal fade" [class.show]="showDuplicateModal" [style.display]="showDuplicateModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Refeições Duplicadas</h5>
            <button type="button" class="btn-close" (click)="cancelImport()"></button>
          </div>
          <div class="modal-body">
            <p>Foram encontradas {{ duplicateMeals.length }} refeições com IDs já existentes.</p>
            <p>Como você deseja proceder?</p>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="importOption" id="duplicate" 
                [(ngModel)]="importOption" value="duplicate">
              <label class="form-check-label" for="duplicate">
                <strong>Duplicar</strong> - Criar novas refeições
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="importOption" id="overwrite" 
                [(ngModel)]="importOption" value="overwrite">
              <label class="form-check-label" for="overwrite">
                <strong>Sobrescrever</strong> - Atualizar refeições existentes
              </label>
            </div>
          </div>
          <div class="modal-footer flex-column flex-sm-row gap-2 gap-sm-0">
            <button type="button" class="btn btn-secondary btn-sm w-100 w-sm-auto" (click)="cancelImport()">Cancelar</button>
            <button type="button" class="btn btn-primary btn-sm w-100 w-sm-auto" (click)="confirmImport()" [disabled]="!importOption">
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Single Backdrop for both modals -->
    <div class="modal-backdrop fade" 
         [class.show]="isVisible || showDuplicateModal" 
         [style.display]="isVisible || showDuplicateModal ? 'block' : 'none'">
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    .modal-footer {
      border-top: 1px solid #dee2e6;
    }
    @media (max-width: 575.98px) {
      .modal-footer {
        padding: 0.75rem;
      }
    }
  `]
})
export class ImportExportComponent {
  isVisible = false;
  startDate = '';
  endDate = '';
  jsonData = '';
  showDuplicateModal = false;
  duplicateMeals: MealData[] = [];
  importOption: 'duplicate' | 'overwrite' | '' = '';
  pendingMeals: MealData[] = [];

  constructor(
    private mealDbService: MealDbService,
    private toastService: ToastService
  ) {}

  show() {
    this.isVisible = true;
    document.body.classList.add('modal-open');
  }

  close() {
    this.isVisible = false;
    document.body.classList.remove('modal-open');
    this.resetForm();
  }

  private resetForm() {
    this.startDate = '';
    this.endDate = '';
    this.jsonData = '';
    this.showDuplicateModal = false;
    this.duplicateMeals = [];
    this.importOption = '';
    this.pendingMeals = [];
  }

  onDateChange() {
    if (this.startDate && this.endDate) {
      this.exportData();
    }
  }

  async copyToClipboard() {
    if (!this.jsonData.trim()) {
      this.toastService.show('Não há dados para copiar', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.jsonData);
      this.toastService.show('Dados copiados para a área de transferência', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.toastService.show('Erro ao copiar dados', 'error');
    }
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.jsonData = text;
      this.toastService.show('Dados colados da área de transferência', 'success');
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      this.toastService.show('Erro ao colar dados. Verifique as permissões do navegador', 'error');
    }
  }

  async exportData() {
    if (!this.startDate || !this.endDate) {
      this.toastService.show('Selecione um período para exportar', 'warning');
      return;
    }

    try {
      const allMeals = await this.mealDbService.getMeals();
      
      // Create start and end dates with time
      const start = new Date(this.startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      // Filter meals within the date range
      const filteredMeals = allMeals.filter(meal => {
        const mealDate = new Date(meal.datetime);
        return mealDate >= start && mealDate <= end;
      });

      // Sort meals by date
      filteredMeals.sort((a, b) => 
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );

      this.jsonData = JSON.stringify(filteredMeals, null, 2);
      this.toastService.show('Dados exportados com sucesso', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.toastService.show('Erro ao exportar dados: ' + errorMessage, 'error');
    }
  }

  async importData() {
    if (!this.jsonData.trim()) {
      this.toastService.show('Insira dados JSON válidos para importar', 'warning');
      return;
    }

    try {
      const meals = JSON.parse(this.jsonData);
      
      if (!Array.isArray(meals)) {
        throw new Error('Os dados devem ser um array de refeições');
      }

      // Validate each meal
      for (const meal of meals) {
        if (!meal.description || !meal.place || !meal.emotion || !meal.datetime) {
          throw new Error('Dados de refeição inválidos');
        }
      }

      // Check for duplicates
      const existingMeals = await this.mealDbService.getMeals();
      const duplicates = meals.filter(meal => 
        meal.id && existingMeals.some(existing => existing.id === meal.id)
      );

      if (duplicates.length > 0) {
        this.duplicateMeals = duplicates;
        this.pendingMeals = meals;
        this.showDuplicateModal = true;
        return;
      }

      await this.processMeals(meals, 'duplicate');

    } catch (error) {
      console.error('Error importing data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.toastService.show('Erro ao importar dados: ' + errorMessage, 'error');
    }
  }

  async processMeals(meals: MealData[], mode: 'duplicate' | 'overwrite') {
    try {
      for (const meal of meals) {
        if (mode === 'duplicate') {
          // Remove ID to create a new entry
          const { id, ...mealWithoutId } = meal;
          await this.mealDbService.addMeal(mealWithoutId);
        } else {
          // Keep ID to update existing entry
          await this.mealDbService.updateMeal(meal);
        }
      }

      this.toastService.show('Dados importados com sucesso', 'success');
      this.close();
    } catch (error) {
      console.error('Error processing meals:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.toastService.show('Erro ao processar refeições: ' + errorMessage, 'error');
    }
  }

  cancelImport() {
    this.showDuplicateModal = false;
    this.duplicateMeals = [];
    this.importOption = '';
    this.pendingMeals = [];
  }

  async confirmImport() {
    if (!this.importOption || !this.pendingMeals.length) return;
    
    this.showDuplicateModal = false;
    await this.processMeals(this.pendingMeals, this.importOption);
  }
} 