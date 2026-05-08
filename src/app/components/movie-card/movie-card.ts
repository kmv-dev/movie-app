import { Component, input, output, inject, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { TruncatePipe } from '../../pipe/truncate.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {
  posterUrl: string | null = null;
  movie = input.required<Movie>();

  private router = inject(Router);
  private movieService = inject(MovieService);

  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly favoriteToggle = output<string>();

  ngOnInit(): void {
    this.loadPoster();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie']) {
      this.loadPoster();
    }
  }

  loadPoster(): void {
    const movieId = this.movie().id;

    // 1. Сначала проверяем пользовательский постер в localStorage
    const savedPoster = this.movieService.getPosterUrl(movieId);
    if (savedPoster) {
      this.posterUrl = savedPoster;
      console.log('Using user uploaded poster:', this.posterUrl);
      return;
    }

    // 2. Если нет, проверяем постер из данных фильма
    const moviePoster = this.movie().posterUrl;
    if (moviePoster) {
      this.posterUrl = moviePoster;
      console.log('Using movie data poster:', this.posterUrl);
      return;
    }

    // 3. Если ничего нет, показываем заглушку
    this.posterUrl = null;
    console.log('No poster found for:', this.movie().title);
  }

  onCardClick(): void {
    this.router.navigate(['/movie', this.movie().id]);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit(this.movie().id);
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.movie().id);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.movie().id);
  }
}
