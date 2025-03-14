import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface MealData {
  id?: number;
  description: string;
  place: string;
  emotion: string;
  datetime: Date;
}

@Component({
  selector: 'app-meal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './meal.component.html',
  styleUrl: './meal.component.scss',
})
export class MealComponent implements OnInit {
  form: FormGroup;

  @Input()
  readonly: boolean = false;

  @Input()
  initialData?: MealData;

  @Output()
  onSubmit = new EventEmitter<MealData>();

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      description: ['', Validators.required],
      place: ['', Validators.required],
      emotion: ['', Validators.required],
      datetime: [this.formatDateForInput(new Date())],
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue({
        description: this.initialData.description,
        place: this.initialData.place,
        emotion: this.initialData.emotion,
        datetime: this.formatDateForInput(new Date(this.initialData.datetime))
      });
    }
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  public onSubmission() {
    if (this.form.valid) {
      const formData = this.form.getRawValue();
      const mealData: MealData = {
        ...(this.initialData?.id ? { id: this.initialData.id } : {}),
        description: formData.description,
        place: formData.place,
        emotion: formData.emotion,
        datetime: new Date(formData.datetime)
      };
      
      this.onSubmit.emit(mealData);
      if (!this.initialData) { // Only reset if it's a new meal
        this.form.reset();
        this.form.controls['datetime'].setValue(this.formatDateForInput(new Date()));
      }
    } else {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
}
