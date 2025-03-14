import { Injectable } from '@angular/core';

interface MealData {
  id?: number;
  description: string;
  place: string;
  emotion: string;
  datetime: Date;
}

interface StoredMealData extends Omit<MealData, 'datetime'> {
  id?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class MealDbService {
  private dbName = 'mealJournal';
  private storeName = 'meals';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDb();
  }

  private initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private toStoredMeal(meal: MealData): StoredMealData {
    return {
      ...meal,
      timestamp: meal.datetime instanceof Date ? meal.datetime.getTime() : new Date(meal.datetime).getTime()
    };
  }

  private toMealData(storedMeal: StoredMealData): MealData {
    const { timestamp, ...rest } = storedMeal;
    return {
      ...rest,
      datetime: new Date(timestamp)
    };
  }

  async addMeal(meal: MealData): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(this.toStoredMeal(meal));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async updateMeal(meal: MealData): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(this.toStoredMeal(meal));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteMeal(id: number): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getMeals(): Promise<MealData[]> {
    if (!this.db) {
      await this.initDb();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      transaction.oncomplete = () => {
        const storedMeals = request.result as StoredMealData[];
        resolve(storedMeals.map(meal => this.toMealData(meal)));
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }
} 