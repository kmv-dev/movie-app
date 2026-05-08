import { Injectable, signal, computed } from '@angular/core';

export type SortByType = 'title' | 'year' | 'createdAt' | 'updatedAt';
export type SortOrderType = 'asc' | 'desc';

export interface FilterState {
  searchTerm: string;
  selectedGenre: string;
  selectedYear: number | null;
  sortBy: SortByType;
  sortOrder: SortOrderType;
  showOnlyFavorites: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private readonly FILTERS_STORAGE_KEY = 'movies_filters';

  private searchTermSignal = signal<string>(this.loadSearchTerm());
  private selectedGenreSignal = signal<string>(this.loadSelectedGenre());
  private selectedYearSignal = signal<number | null>(this.loadSelectedYear());
  private sortBySignal = signal<SortByType>(this.loadSortBy());
  private sortOrderSignal = signal<SortOrderType>(this.loadSortOrder());
  private showOnlyFavoritesSignal = signal<boolean>(this.loadShowOnlyFavorites());

  // Публичные сигналы
  public searchTerm = this.searchTermSignal.asReadonly();
  public selectedGenre = this.selectedGenreSignal.asReadonly();
  public selectedYear = this.selectedYearSignal.asReadonly();
  public sortBy = this.sortBySignal.asReadonly();
  public sortOrder = this.sortOrderSignal.asReadonly();
  public showOnlyFavorites = this.showOnlyFavoritesSignal.asReadonly();

  // Количество активных фильтров
  public activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedGenreSignal() !== 'all') count++;
    if (this.selectedYearSignal() !== null) count++;
    if (this.showOnlyFavoritesSignal()) count++;
    if (this.searchTermSignal().length >= 3) count++;
    return count;
  });

  constructor() {
    this.saveFiltersToStorage();
  }

  // Метод для фильтрации и сортировки
  public filterAndSortMovies<T extends {
    favorite?: boolean;
    genre: string;
    year?: number;
    title: string;
    director: string;
    actors: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }>(movies: T[]): T[] {
    let result = [...movies];

    if (this.showOnlyFavoritesSignal()) {
      result = result.filter(m => m.favorite === true);
    }

    if (this.selectedGenreSignal() !== 'all') {
      result = result.filter(m => m.genre === this.selectedGenreSignal());
    }

    if (this.selectedYearSignal()) {
      result = result.filter(m => m.year === this.selectedYearSignal());
    }

    const searchTerm = this.searchTermSignal().toLowerCase().trim();
    if (searchTerm.length >= 3) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(searchTerm) ||
        m.director.toLowerCase().includes(searchTerm) ||
        m.actors.toLowerCase().includes(searchTerm) ||
        (m.description && m.description.toLowerCase().includes(searchTerm))
      );
    }

    const sortBy = this.sortBySignal();
    const sortOrder = this.sortOrderSignal();

    return [...result].sort((a, b) => {
      let valA: any, valB: any;
      if (sortBy === 'title') {
        valA = a.title;
        valB = b.title;
      } else if (sortBy === 'year') {
        valA = a.year || 0;
        valB = b.year || 0;
      } else if (sortBy === 'updatedAt') {
        valA = new Date(a.updatedAt).getTime();
        valB = new Date(b.updatedAt).getTime();
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Геттеры
  getSelectedGenre(): string {
    return this.selectedGenreSignal();
  }

  getSelectedYear(): number | null {
    return this.selectedYearSignal();
  }

  getSelectedSortBy(): SortByType {
    return this.sortBySignal();
  }

  getSelectedSortOrder(): SortOrderType {
    return this.sortOrderSignal();
  }

  getShowOnlyFavorites(): boolean {
    return this.showOnlyFavoritesSignal();
  }

  // Сеттеры
  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
    this.saveFiltersToStorage();
  }

  setGenre(genre: string): void {
    this.selectedGenreSignal.set(genre);
    this.saveFiltersToStorage();
  }

  setYear(year: number | null): void {
    this.selectedYearSignal.set(year);
    this.saveFiltersToStorage();
  }

  setSorting(sortBy: SortByType, order: SortOrderType): void {
    this.sortBySignal.set(sortBy);
    this.sortOrderSignal.set(order);
    this.saveFiltersToStorage();
  }

  setShowOnlyFavorites(value: boolean): void {
    this.showOnlyFavoritesSignal.set(value);
    this.saveFiltersToStorage();
  }

  clearFilters(): void {
    this.setSearchTerm('');
    this.setGenre('all');
    this.setYear(null);
    this.setShowOnlyFavorites(false);
    this.setSorting('updatedAt', 'desc');
  }

  toggleShowOnlyFavorites(): void {
    this.showOnlyFavoritesSignal.update(value => !value);
    this.saveFiltersToStorage();
  }

  resetGenre(): void {
    this.setGenre('all');
  }

  resetYear(): void {
    this.setYear(null);
  }

  resetSearch(): void {
    this.setSearchTerm('');
  }

  // Сохранение/загрузка
  private saveFiltersToStorage(): void {
    const filters = {
      searchTerm: this.searchTermSignal(),
      genre: this.selectedGenreSignal(),
      year: this.selectedYearSignal(),
      sortBy: this.sortBySignal(),
      sortOrder: this.sortOrderSignal(),
      showOnlyFavorites: this.showOnlyFavoritesSignal()
    };
    localStorage.setItem(this.FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }

  private loadSearchTerm(): string {
    const saved = localStorage.getItem(this.FILTERS_STORAGE_KEY);
    if (saved) {
      const filters = JSON.parse(saved);
      return filters.searchTerm || '';
    }
    return '';
  }

  private loadSelectedGenre(): string {
    const saved = localStorage.getItem(this.FILTERS_STORAGE_KEY);
    if (saved) {
      const filters = JSON.parse(saved);
      return filters.genre || 'all';
    }
    return 'all';
  }

  private loadSelectedYear(): number | null {
    const saved = localStorage.getItem(this.FILTERS_STORAGE_KEY);
    if (saved) {
      const filters = JSON.parse(saved);
      return filters.year !== undefined ? filters.year : null;
    }
    return null;
  }

  private loadSortBy(): SortByType {
    const saved = localStorage.getItem(this.FILTERS_STORAGE_KEY);
    if (saved) {
      const filters = JSON.parse(saved);
      return filters.sortBy || 'updatedAt';
    }
    return 'updatedAt';
  }

  private loadSortOrder(): SortOrderType {
    const saved = localStorage.getItem(this.FILTERS_STORAGE_KEY);
    if (saved) {
      const filters = JSON.parse(saved);
      return filters.sortOrder || 'desc';
    }
    return 'desc';
  }

  private loadShowOnlyFavorites(): boolean {
    const saved = localStorage.getItem(this.FILTERS_STORAGE_KEY);
    if (saved) {
      const filters = JSON.parse(saved);
      return filters.showOnlyFavorites || false;
    }
    return false;
  }
}
