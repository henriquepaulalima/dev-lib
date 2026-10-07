import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CatalogEntry } from '../../models/library-entry';
import { LibraryApi } from '../../services/library-api';
import { catalogEntry } from '../../testing';
import { Collection } from './collection';

describe('Collection', () => {
  function render(search: LibraryApi['search']) {
    TestBed.configureTestingModule({
      imports: [Collection],
      providers: [
        provideRouter([]),
        { provide: LibraryApi, useValue: { search } },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { entryType: 'component', heading: 'Components', description: 'Reusable parts' } } } }
      ]
    });
    const fixture = TestBed.createComponent(Collection);
    fixture.detectChanges();
    return fixture;
  }
  const text = (fixture: { nativeElement: HTMLElement }) => fixture.nativeElement.textContent?.replace(/\s+/g, ' ') ?? '';

  it('loads entries of the route type and lists them with their first three tags', () => {
    const search = vi.fn().mockReturnValue(of([catalogEntry(), catalogEntry({ slug: 'tabs', title: 'Tabs', tags: [] })]));
    const fixture = render(search);

    expect(search).toHaveBeenCalledWith('', 'component');
    expect(text(fixture)).toContain('2 entries');
    expect(fixture.nativeElement.querySelectorAll('a.entry')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('a.entry')?.getAttribute('href')).toBe('/entry/dialog');
    const tags = [...fixture.nativeElement.querySelector('a.entry .entry__tags').querySelectorAll('small')].map((tag) => (tag as HTMLElement).textContent);
    expect(tags).toEqual(['#overlay', '#a11y', '#modal']);
  });

  it('shows a loading state until entries arrive', () => {
    const results = new Subject<CatalogEntry[]>();
    const fixture = render(() => results);

    expect(text(fixture)).toContain('Loading components…');
    results.next([catalogEntry()]);
    fixture.detectChanges();
    expect(text(fixture)).toContain('1 entry');
  });

  it('shows an empty state', () => {
    expect(text(render(() => of([])))).toContain('No components have been added yet.');
  });

  it('shows an error when the API fails', () => {
    const fixture = render(() => throwError(() => new Error('offline')));

    expect(text(fixture)).toContain('The components could not be loaded. Check that the API is running.');
  });
});
