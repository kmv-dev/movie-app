import { Injectable, signal, computed, inject } from '@angular/core';
import { Movie, MovieFormData } from '../models/movie.model';
import { INITIAL_MOVIES } from '../data/movies.data';
import { v4 as uuidv4 } from 'uuid';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly STORAGE_KEY = 'movies_catalog';
  private filterService = inject(FilterService);

  private moviesSignal = signal<Movie[]>([]);
  public movies = this.moviesSignal.asReadonly();

  // Отфильтрованные фильмы через FilterService
  public filteredMovies = computed(() => {
    const movies = this.moviesSignal();
    return this.filterService.filterAndSortMovies(movies);
  });

  constructor() {
    this.loadFromStorage();
    this.initializeDataIfEmpty();
  }

  // Инициализация начальными данными
  private initializeDataIfEmpty(): void {
    if (this.moviesSignal().length === 0) {
      this.moviesSignal.set(INITIAL_MOVIES);
      this.saveToStorage();
    }
  }

  // Загрузка из localStorage
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

  // Сохранение в localStorage
  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.moviesSignal()));
  }

  // CRUD операции
  addMovie(movieData: MovieFormData, posterBase64?: string | null): Movie {
    const newMovie: Movie = {
      id: uuidv4(),
      title: movieData.title,
      genre: movieData.genre,
      year: movieData.year || undefined,
      director: movieData.director,
      actors: movieData.actors,
      description: movieData.description || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      favorite: false
    };

    this.moviesSignal.update(movies => [...movies, newMovie]);
    this.saveToStorage();

    if (posterBase64) {
      this.savePoster(newMovie.id, posterBase64);
    }

    return newMovie;
  }

  updateMovie(id: string, movieData: MovieFormData): void {
    this.moviesSignal.update(movies =>
      movies.map(movie =>
        movie.id === id
          ? {
            ...movie,
            title: movieData.title,
            genre: movieData.genre,
            year: movieData.year || undefined,
            director: movieData.director,
            actors: movieData.actors,
            description: movieData.description || undefined,
            updatedAt: new Date()
          }
          : movie
      )
    );
    this.saveToStorage();
  }

  deleteMovie(id: string): void {
    this.moviesSignal.update(movies => movies.filter(m => m.id !== id));
    this.saveToStorage();
    this.deletePoster(id);
  }

  getMovieById(id: string): Movie | undefined {
    return this.moviesSignal().find(m => m.id === id);
  }

  toggleFavorite(id: string): void {
    this.moviesSignal.update(movies =>
      movies.map(m =>
        m.id === id ? { ...m, favorite: !m.favorite } : m
      )
    );
    this.saveToStorage();
  }

  // Работа с постерами
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

  // Вспомогательные методы
  getUniqueGenres(): string[] {
    return [...new Set(this.moviesSignal().map(m => m.genre))].sort();
  }

  getUniqueYears(): number[] {
    const years = this.moviesSignal()
      .map(m => m.year)
      .filter((y): y is number => y !== undefined);
    return [...new Set(years)].sort((a, b) => b - a);
  }
}