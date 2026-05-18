import { Component, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie-service';
import { MovieFormData, Movie } from '../../models/movie.model';
import { PosterUploadComponent } from '../poster-upload/poster-upload';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PosterUploadComponent],
  templateUrl: './movie-form.html',
  styleUrls: ['./movie-form.scss']
})
export class MovieFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private movieService = inject(MovieService);

  movieId = input<string | null>(null);
  isEditMode = input(false);
  isViewMode = input(false);  // ← Добавьте эту строку
  onClose = output();
  onSave = output();

  movieForm!: FormGroup;
  currentPoster: string | null = null;
  private pendingPoster: string | null = null;

  ngOnInit(): void {
    this.movieForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      genre: ['', Validators.required],
      year: [null, [Validators.min(1888), Validators.max(2026)]],
      director: ['', Validators.required],
      actors: ['', Validators.required],
      description: ['']
    });

    if (this.isEditMode() && this.movieId()) {
      const movie = this.movieService.getMovieById(this.movieId()!);
      if (movie) {
        this.movieForm.patchValue({
          title: movie.title,
          genre: movie.genre,
          year: movie.year || null,
          director: movie.director,
          actors: movie.actors,
          description: movie.description || ''
        });
        this.currentPoster = this.movieService.getPosterUrl(this.movieId()!);
      }
    }

    // Если режим просмотра - отключаем все поля формы
    if (this.isViewMode()) {
      this.movieForm.disable();
    }
  }

  onSubmit(): void {


    if (this.movieForm.invalid) {
      Object.keys(this.movieForm.controls).forEach(key => {
        this.movieForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData: MovieFormData = this.movieForm.value;

    if (this.isEditMode() && this.movieId()) {
      this.movieService.updateMovie(this.movieId()!, formData);
      if (this.pendingPoster) {
        this.movieService.savePoster(this.movieId()!, this.pendingPoster);
      }
      this.movieService.refreshPosters();
    } else {
      this.movieService.addMovie(formData, this.pendingPoster);
      this.movieService.refreshPosters();
    }

    this.onSave.emit();
  }

  onPosterRemoved(): void {

    this.pendingPoster = null;
    this.currentPoster = null;

    if (this.isEditMode() && this.movieId()) {
      this.movieService.deletePoster(this.movieId()!);
    }
  }
}
