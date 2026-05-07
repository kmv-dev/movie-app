import { Routes } from '@angular/router';
import { MainPage } from './pages/main-page/main-page';
import { MovieDetails } from './pages/movie-details/movie-details'

export const routes: Routes = [
  { path: '', component: MainPage },
  { path: 'movie/:id', component: MovieDetails },
  { path: '**', redirectTo: '' }
];
