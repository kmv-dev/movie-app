export interface Movie {
  id: string;
  title: string;
  genre: string;
  year?: number;
  director: string;
  actors: string;
  description?: string;
  posterUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  favorite?: boolean;
}

export interface MovieFormData {
  title: string;
  genre: string;
  year?: number | null;
  director: string;
  actors: string;
  description?: string | null;
  posterUrl?: string | null;
}