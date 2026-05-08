import { Component, inject, computed, OnInit, output, OnDestroy, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../services/filter.service';
import { MovieService } from '../../services/movie-service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.html',
  styleUrls: ['./filters.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private filterService = inject(FilterService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  readonly addMovie = output<void>();
  searchTerm = this.filterService.searchTerm;
  // Состояния - инициализируем из сервиса
  isLoading = signal(false);
  selectedGenre = signal(this.filterService.getSelectedGenre());
  selectedYear = signal(this.filterService.getSelectedYear());
  selectedSortBy = signal(this.filterService.getSelectedSortBy());
  selectedSortOrder = signal(this.filterService.getSelectedSortOrder());
  showOnlyFavorites = signal(this.filterService.getShowOnlyFavorites());

  // Вычисляемые значения
  genres = computed(() => this.movieService.getUniqueGenres());
  years = computed(() => this.movieService.getUniqueYears());
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedGenre() !== 'all') count++;
    if (this.selectedYear() !== null) count++;
    if (this.showOnlyFavorites()) count++;
    return count;
  });

  constructor() {
    // Синхронизация изменений с сервисом
    effect(() => {
      this.filterService.setGenre(this.selectedGenre());
    });

    effect(() => {
      this.filterService.setYear(this.selectedYear());
    });

    effect(() => {
      this.filterService.setSorting(this.selectedSortBy(), this.selectedSortOrder());
    });

    effect(() => {
      this.filterService.setShowOnlyFavorites(this.showOnlyFavorites());
    });
  }

  ngOnInit(): void {
    // Настройка поиска с debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterService.setSearchTerm(searchTerm);
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onAddMovieClick(event: Event): void {
    event.stopPropagation();
    this.addMovie.emit();
  }

  onGenreChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.selectedGenre.set(value);
  }

  onYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value === 'all' ? null : Number(select.value);
    this.selectedYear.set(value);
  }

  onSortingChange(): void {
    this.filterService.setSorting(
      this.selectedSortBy(),
      this.selectedSortOrder()
    );
  }

  clearSearch(): void {
    this.filterService.setSearchTerm('');

    // Очищаем поле ввода
    const searchInput = document.querySelector('.search-box__input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }

  toggleFavoritesFilter(): void {
    this.showOnlyFavorites.update(value => !value);
  }

  clearFilters(): void {
    this.isLoading.set(true);

    // Сброс UI
    this.selectedGenre.set('all');
    this.selectedYear.set(null);
    this.selectedSortBy.set('updatedAt');
    this.selectedSortOrder.set('desc');
    this.showOnlyFavorites.set(false);

    // Сброс в сервисе
    this.filterService.clearFilters();

    // Сброс поля поиска
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) searchInput.value = '';

    setTimeout(() => {
      this.isLoading.set(false);
    }, 300);
  }

  getGenreLabel(): string {
    const genre = this.selectedGenre();
    if (genre === 'all') return 'Все жанры';
    return genre;
  }

  resetGenre(): void {
    this.selectedGenre.set('all');
  }

  resetYear(): void {
    this.selectedYear.set(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }
}
