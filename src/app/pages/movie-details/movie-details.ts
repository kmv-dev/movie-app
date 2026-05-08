import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie-service'
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details.html',
  styleUrls: ['./movie-details.scss']
})
export class MovieDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);

  movie = signal<Movie | null>(null);
  isLoading = signal(true);
  posterError = signal(false);
  posterUrl = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovie(id);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadMovie(id: string): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const movie = this.movieService.getMovieById(id);
      if (movie) {
        this.movie.set(movie);
        this.loadPoster(id);
      } else {
        this.router.navigate(['/']);
      }
      this.isLoading.set(false);
    }, 500);
  }

  private loadPoster(id: string): void {
    const poster = this.movieService.getPosterUrl(id);
    if (poster) {
      this.posterUrl.set(poster);
    } else if (this.movie()?.posterUrl) {
      this.posterUrl.set(this.movie()!.posterUrl!);
    }
  }

  getYearBadge(year: number | undefined): string {
    return year ? year.toString() : 'Н/Д';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleFavorite(): void {
    if (this.movie()) {
      this.movieService.toggleFavorite(this.movie()!.id);
      this.movie.update(m => m ? { ...m, favorite: !m.favorite } : null);
    }
  }
}
