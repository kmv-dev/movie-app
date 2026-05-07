import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  template: `
    <app-header></app-header>
    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main {
      padding: 20px;
      min-height: calc(100vh - 80px);
    }
  `]
})
export class AppComponent { }
