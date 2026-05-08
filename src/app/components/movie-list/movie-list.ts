import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCard } from '../movie-card/movie-card';
import { MovieService } from '../../services/movie-service';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss',
})
export class MovieList {
  private movieService = inject(MovieService);

  movies = this.movieService.filteredMovies;
  readonly editMovie = output<string>();

  onToggleFavorite(id: string): void {
    this.movieService.toggleFavorite(id);
  }

  onEditMovie(id: string): void {
    this.editMovie.emit(id);
  }

  onDeleteMovie(id: string): void {
    if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
      this.movieService.deleteMovie(id);
    }
  }
}
