import { Component } from '@angular/core';
import { MovieList } from '../../components/movie-list/movie-list'

@Component({
  selector: 'app-main-page',
  imports: [MovieList],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage { }
