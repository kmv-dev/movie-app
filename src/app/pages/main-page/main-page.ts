import { Component, inject } from '@angular/core';
import { MovieList } from '../../components/movie-list/movie-list'
import { FiltersComponent } from '../../components/filters/filters'
import { MovieFormComponent } from '../../components/movie-form/movie-form';
import { MovieService } from '../../services/movie-service'
import { NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-main-page',
  imports: [MovieList, FiltersComponent, MovieFormComponent],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})

export class MainPage {
  movieService = inject(MovieService);
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/movies') {
        // Принудительно обновляем список при возврате
        this.movieService.refreshPosters();
      }
    });
  }
  showForm = false;
  selectedMovieId: string | null = null;
  isEditMode = false;

  openAddForm(): void {
    this.selectedMovieId = null;
    this.isEditMode = false;
    this.showForm = true;
  }

  openEditForm(id: string): void {
    this.selectedMovieId = id;
    this.isEditMode = true;
    this.showForm = true;
  }

  deleteMovie(id: string): void {
    if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
      this.movieService.deleteMovie(id);
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedMovieId = null;
    this.isEditMode = false;
  }
}
