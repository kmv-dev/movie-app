import { Component, input, output, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie-service';

@Component({
  selector: 'app-poster-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poster-upload.html',
  styleUrls: ['./poster-upload.scss']
})
export class PosterUploadComponent {
  private movieService = inject(MovieService);

  movieId = input.required<string>();
  movieTitle = input<string>('');
  posterPreview = input<string | null>(null);
  isLoading = input<boolean>(false);
  posterChanged = output<string>();
  posterRemoved = output<void>();

  // Локальный сигнал для нового постера (base64)
  private newPoster = signal<string | null>(null);

  // Итоговый постер для отображения (сначала новый, потом из props)
  displayPoster = computed(() => {
    // Приоритет у нового постера (который только что загрузили)
    return this.newPoster() || this.posterPreview();
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер изображения не должен превышать 2MB');
      return;
    }

    // Конвертируем в base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      // Сохраняем новый постер локально (приоритетный)
      this.newPoster.set(base64);
      // Сохраняем в сервис
      this.movieService.savePoster(this.movieId(), base64);
      this.posterChanged.emit(base64);
    };
    reader.readAsDataURL(file);
  }

  removePoster(): void {
    if (confirm('Удалить постер?')) {
      // Очищаем новый постер
      this.newPoster.set(null);
      // Удаляем из сервиса
      this.movieService.deletePoster(this.movieId());
      this.posterRemoved.emit();
    }
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  // Сброс нового постера (если нужно отменить изменения)
  resetNewPoster(): void {
    this.newPoster.set(null);
  }
}