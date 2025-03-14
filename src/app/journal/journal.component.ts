import { Component, OnInit } from '@angular/core';
import { MealDbService } from '../services/meal-db.service';
import { MealComponent } from '../meal/meal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from '../components/toast/toast.component';

interface MealData {
  id?: number;
  description: string;
  place: string;
  emotion: string;
  datetime: Date;
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [MealComponent, CommonModule, FormsModule, ToastComponent],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss'
})
export class JournalComponent implements OnInit {
  currentMeal: MealData | undefined = undefined;
  todaysMeals: MealData[] = [];
  editingMealId: number | null = null;
  selectedDate: string;
  availableDates: Set<string> = new Set();
  showDeleteModal = false;
  mealToDelete: number | null = null;

  constructor(
    private mealDbService: MealDbService,
    private toastService: ToastService
  ) {
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
  }

  ngOnInit() {
    this.loadAvailableDates();
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async loadAvailableDates() {
    try {
      const allMeals = await this.mealDbService.getMeals();
      this.availableDates = new Set(
        allMeals.map(meal => this.formatDateForInput(new Date(meal.datetime)))
      );
      this.loadMealsForDate(this.selectedDate);
    } catch (error) {
      console.error('Error loading dates:', error);
      this.toastService.show('Erro ao carregar datas', 'error');
    }
  }

  async loadMealsForDate(dateStr: string) {
    try {
      const allMeals = await this.mealDbService.getMeals();
      // Create start and end dates in local timezone
      const [year, month, day] = dateStr.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const nextDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      this.todaysMeals = allMeals
        .filter(meal => {
          const mealDate = new Date(meal.datetime);
          return mealDate >= selectedDate && mealDate <= nextDay;
        })
        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    } catch (error) {
      console.error('Error loading meals:', error);
      this.toastService.show('Erro ao carregar refeições', 'error');
    }
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.loadMealsForDate(this.selectedDate);
  }

  isDateAvailable(date: string): boolean {
    return this.availableDates.has(date);
  }

  onSubmit(formValues: MealData) {
    // If we're editing, preserve the ID
    if (this.editingMealId) {
      formValues.id = this.editingMealId;
    }
    this.submit(formValues);
  }

  private async submit(meal: MealData) {
    try {
      if (this.editingMealId) {
        await this.mealDbService.updateMeal(meal);
        this.editingMealId = null;
        this.toastService.show('Refeição atualizada com sucesso', 'success');
      } else {
        await this.mealDbService.addMeal(meal);
        this.toastService.show('Refeição registrada com sucesso', 'success');
      }
      this.currentMeal = undefined;
      await this.loadAvailableDates();
    } catch (error) {
      console.error('Error saving meal:', error);
      this.toastService.show('Erro ao salvar refeição', 'error');
    }
  }

  startEditing(meal: MealData) {
    if (this.editingMealId === null) {
      this.editingMealId = meal.id ?? null;
      this.currentMeal = { ...meal };
    }
  }

  cancelEditing() {
    this.editingMealId = null;
    this.currentMeal = undefined;
  }

  confirmDelete(id: number) {
    this.mealToDelete = id;
    this.showDeleteModal = true;
  }

  async deleteMeal() {
    if (this.mealToDelete === null) return;
    
    try {
      await this.mealDbService.deleteMeal(this.mealToDelete);
      this.toastService.show('Refeição excluída com sucesso', 'success');
      await this.loadAvailableDates();
    } catch (error) {
      console.error('Error deleting meal:', error);
      this.toastService.show('Erro ao excluir refeição', 'error');
    } finally {
      this.showDeleteModal = false;
      this.mealToDelete = null;
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.mealToDelete = null;
  }

  formatTime(datetime: Date | string): string {
    return new Date(datetime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
