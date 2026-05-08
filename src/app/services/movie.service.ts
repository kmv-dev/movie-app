import { Injectable, signal, computed } from '@angular/core';
import { Movie } from '../models/movie.model';
import { INITIAL_MOVIES } from '../data/movies.data';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly STORAGE_KEY = 'movies_catalog';

  private moviesSignal = signal<Movie[]>([]);
  public movies = this.moviesSignal.asReadonly();

  constructor() {
    this.loadFromStorage();
    this.initializeDataIfEmpty();
  }

  private initializeDataIfEmpty(): void {
    if (this.moviesSignal().length === 0) {
      this.moviesSignal.set(INITIAL_MOVIES);
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const movies = JSON.parse(stored, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
        return value;
      });
      this.moviesSignal.set(movies);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.moviesSignal()));
  }

  deleteMovie(id: string): void {
    this.moviesSignal.update(movies => movies.filter(m => m.id !== id));
    this.saveToStorage();
    this.deletePoster(id);
  }

  getMovieById(id: string): Movie | undefined {
    return this.moviesSignal().find(m => m.id === id);
  }

  // Постеры
  private getPosters(): Record<string, string> {
    const stored = localStorage.getItem('movie_posters');
    return stored ? JSON.parse(stored) : {};
  }

  savePoster(id: string, base64Image: string): void {
    const posters = this.getPosters();
    posters[id] = base64Image;
    localStorage.setItem('movie_posters', JSON.stringify(posters));
    this.moviesSignal.set([...this.moviesSignal()]);
  }

  getPosterUrl(id: string): string | null {
    const posters = this.getPosters();
    return posters[id] || null;
  }

  deletePoster(id: string): void {
    const posters = this.getPosters();
    delete posters[id];
    localStorage.setItem('movie_posters', JSON.stringify(posters));
  }

  refreshPosters(): void {
    this.moviesSignal.set([...this.moviesSignal()]);
  }

  getUniqueGenres(): string[] {
    return [...new Set(this.moviesSignal().map(m => m.genre))].sort();
  }

  getUniqueYears(): number[] {
    const years = this.moviesSignal()
      .map(m => m.year)
      .filter((y): y is number => y !== undefined);
    return [...new Set(years)].sort((a, b) => b - a);
  }

  toggleFavorite(id: string): void {
    this.moviesSignal.update(movies =>
      movies.map(m =>
        m.id === id ? { ...m, favorite: !m.favorite } : m
      )
    );
    this.saveToStorage();
  }
}