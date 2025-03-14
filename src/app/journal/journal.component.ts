import { Component, OnInit } from '@angular/core';
import { MealDbService } from '../services/meal-db.service';
import { MealComponent } from '../meal/meal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [MealComponent, CommonModule, FormsModule],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss'
})
export class JournalComponent implements OnInit {
  currentMeal: any = null;
  todaysMeals: any[] = [];
  editingMealId: number | null = null;
  selectedDate: string;
  availableDates: Set<string> = new Set();

  constructor(private mealDbService: MealDbService) {
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
  }

  ngOnInit() {
    this.loadAvailableDates();
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private async loadAvailableDates() {
    try {
      const allMeals = await this.mealDbService.getMeals();
      this.availableDates = new Set(
        allMeals.map(meal => {
          const date = new Date(meal.timestamp);
          return this.formatDateForInput(date);
        })
      );
      this.loadMealsForDate(this.selectedDate);
    } catch (error) {
      console.error('Error loading dates:', error);
    }
  }

  async loadMealsForDate(dateStr: string) {
    try {
      const allMeals = await this.mealDbService.getMeals();
      const selectedDate = new Date(dateStr + 'T00:00:00');
      const nextDay = new Date(dateStr + 'T23:59:59.999');

      this.todaysMeals = allMeals
        .filter(meal => {
          const mealDate = new Date(meal.timestamp);
          return mealDate >= selectedDate && mealDate <= nextDay;
        })
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.loadMealsForDate(this.selectedDate);
  }

  isDateAvailable(date: string): boolean {
    return this.availableDates.has(date);
  }

  onSubmit(formValues: any) {
    this.currentMeal = formValues;
    this.submit();
  }

  async submit() {
    if (this.currentMeal) {
      try {
        if (this.editingMealId) {
          await this.mealDbService.updateMeal(this.currentMeal);
          this.editingMealId = null;
        } else {
          await this.mealDbService.addMeal(this.currentMeal);
        }
        this.currentMeal = null;
        await this.loadAvailableDates();
      } catch (error) {
        console.error('Error saving meal:', error);
        alert('Error saving meal. Please try again.');
      }
    }
  }

  startEditing(meal: any) {
    this.editingMealId = meal.id;
  }

  cancelEditing() {
    this.editingMealId = null;
  }

  async deleteMeal(id: number) {
    if (confirm('Are you sure you want to delete this meal?')) {
      try {
        await this.mealDbService.deleteMeal(id);
        await this.loadAvailableDates();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Error deleting meal. Please try again.');
      }
    }
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
