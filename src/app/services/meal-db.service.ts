import { Injectable } from '@angular/core';

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

  async addMeal(meal: any): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Ensure datetime is stored as timestamp
      const mealToStore = {
        ...meal,
        timestamp: meal.datetime instanceof Date ? meal.datetime.getTime() : new Date(meal.datetime).getTime()
      };

      const request = store.add(mealToStore);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async updateMeal(meal: any): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const mealToStore = {
        ...meal,
        timestamp: meal.datetime instanceof Date ? meal.datetime.getTime() : new Date(meal.datetime).getTime()
      };

      const request = store.put(mealToStore);

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

  async getMeals(): Promise<any[]> {
    if (!this.db) {
      await this.initDb();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
    });
  }
} 