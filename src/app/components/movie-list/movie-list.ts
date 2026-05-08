import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCard } from '../movie-card/movie-card';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss',
})
export class MovieList {
  private movieService = inject(MovieService);

  movies = this.movieService.movies;

  onToggleFavorite(id: string): void {
    this.movieService.toggleFavorite(id);
  }

  onEditMovie(id: string): void {
    console.log('Edit movie:', id);
    // TODO: Открыть модальное окно редактирования
  }

  onDeleteMovie(id: string): void {
    if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
      this.movieService.deleteMovie(id);
    }
  }
}
