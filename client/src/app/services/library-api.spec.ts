import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { LibraryApi } from './library-api';

describe('LibraryApi', () => {
  let api: LibraryApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(LibraryApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('searches the catalog with a trimmed query', () => {
    api.search('  dialog  ').subscribe();

    const request = http.expectOne((req) => req.url === `${environment.apiUrl}/catalog`);
    expect(request.request.params.get('q')).toBe('dialog');
    expect(request.request.params.has('type')).toBe(false);
    request.flush([]);
  });

  it('filters the catalog by entry type', () => {
    api.search('', 'feature').subscribe();

    const request = http.expectOne((req) => req.url === `${environment.apiUrl}/catalog`);
    expect(request.request.params.get('q')).toBe('');
    expect(request.request.params.get('type')).toBe('feature');
    request.flush([]);
  });

  it('loads catalog and library details together with an encoded slug', () => {
    let result: unknown;
    api.getDetails('a/b c').subscribe((details) => (result = details));

    http.expectOne(`${environment.apiUrl}/catalog/a%2Fb%20c`).flush({ slug: 'a/b c' });
    http.expectOne(`${environment.apiUrl}/library/a%2Fb%20c`).flush({ overview: 'text' });

    expect(result).toEqual({ catalog: { slug: 'a/b c' }, content: { overview: 'text' } });
  });
});
