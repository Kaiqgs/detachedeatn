import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JournalComponent } from './journal/journal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JournalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'detachedeatn';
}
