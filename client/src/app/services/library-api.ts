import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { CatalogEntry, EntryDetails, EntryType, LibraryContent } from '../models/library-entry';

@Injectable({ providedIn: 'root' })
export class LibraryApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  search(query = '', type?: EntryType): Observable<CatalogEntry[]> {
    let params = new HttpParams().set('q', query.trim());
    if (type) params = params.set('type', type);
    return this.http.get<CatalogEntry[]>(`${this.baseUrl}/catalog`, { params });
  }

  getDetails(slug: string): Observable<EntryDetails> {
    return forkJoin({
      catalog: this.http.get<CatalogEntry>(`${this.baseUrl}/catalog/${encodeURIComponent(slug)}`),
      content: this.http.get<LibraryContent>(`${this.baseUrl}/library/${encodeURIComponent(slug)}`)
    });
  }
}
