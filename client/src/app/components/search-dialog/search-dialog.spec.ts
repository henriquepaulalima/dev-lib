import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LibraryApi } from '../../services/library-api';
import { catalogEntry, installBrowserStubs } from '../../testing';
import { SearchDialog } from './search-dialog';

describe('SearchDialog', () => {
  const entries = [
    catalogEntry(),
    catalogEntry({ slug: 'tabs', title: 'Tabs', subcomponents: [{ slug: 'scrollable', title: 'Scrollable tabs', summary: 'Overflow', tags: ['scroll'] }] }),
    catalogEntry({ slug: 'websocket', type: 'feature', title: 'WebSocket' })
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    installBrowserStubs();
  });
  afterEach(() => vi.useRealTimers());

  function render(search = vi.fn().mockReturnValue(of(entries))) {
    TestBed.configureTestingModule({ imports: [SearchDialog], providers: [provideRouter([]), { provide: LibraryApi, useValue: { search } }] });
    const fixture = TestBed.createComponent(SearchDialog);
    fixture.detectChanges();
    vi.advanceTimersByTime(180);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    return { fixture, component: fixture.componentInstance, search, navigate, dialog: fixture.nativeElement.querySelector('dialog') as HTMLDialogElement };
  }
  const key = (key: string, extra: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key, cancelable: true, ...extra });

  it('loads the library with an empty query and lists at most eight entries', () => {
    const many = Array.from({ length: 10 }, (_, index) => catalogEntry({ slug: `entry-${index}` }));
    const { component, search } = render(vi.fn().mockReturnValue(of(many)));

    expect(search).toHaveBeenCalledWith('');
    expect(component.entries()).toHaveLength(8);
    expect(component.loading()).toBe(false);
  });

  it('debounces typing and only searches changed queries', () => {
    const { component, search } = render();

    component.search.setValue('d');
    component.search.setValue('di');
    vi.advanceTimersByTime(100);
    component.search.setValue('dia');
    vi.advanceTimersByTime(180);
    component.search.setValue('dia');
    vi.advanceTimersByTime(180);

    expect(search.mock.calls.map(([query]) => query)).toEqual(['', 'dia']);
  });

  it('expands entries whose variants match the query', () => {
    const { component } = render();

    component.search.setValue('scroll');
    vi.advanceTimersByTime(180);

    expect(component.isExpanded('tabs')).toBe(true);
    expect(component.isExpanded('dialog')).toBe(false);
    component.toggleSubcomponents('tabs');
    expect(component.isExpanded('tabs')).toBe(false);
  });

  it('shows an error when search fails', () => {
    const { fixture } = render(vi.fn().mockReturnValue(throwError(() => new Error('down'))));

    expect(fixture.nativeElement.textContent).toContain('Search is unavailable. Check that the API is running.');
  });

  it('toggles with Ctrl+K and Cmd+K', () => {
    const { component, dialog } = render();

    const ctrl = key('k', { ctrlKey: true });
    component.handleShortcut(ctrl);
    expect(dialog.open).toBe(true);
    expect(ctrl.defaultPrevented).toBe(true);

    component.handleShortcut(key('K', { metaKey: true }));
    expect(dialog.open).toBe(false);

    component.handleShortcut(key('k'));
    expect(dialog.open).toBe(false);
  });

  it('closes when the backdrop is clicked but not the panel', () => {
    const { component, dialog } = render();
    component.open();

    component.handleBackdrop({ target: dialog.querySelector('section'), currentTarget: dialog } as unknown as MouseEvent);
    expect(dialog.open).toBe(true);
    component.handleBackdrop({ target: dialog, currentTarget: dialog } as unknown as MouseEvent);
    expect(dialog.open).toBe(false);
  });

  it('moves through results with the arrow keys, wrapping around', () => {
    const { component } = render();

    component.handleInputKeydown(key('ArrowDown'));
    component.handleInputKeydown(key('ArrowDown'));
    expect(component.activeIndex()).toBe(1);
    component.handleInputKeydown(key('ArrowUp'));
    component.handleInputKeydown(key('ArrowUp'));
    expect(component.activeIndex()).toBe(2);
    component.handleInputKeydown(key('ArrowDown'));
    expect(component.activeIndex()).toBe(0);
  });

  it('opens the active result with Enter and closes the dialog', () => {
    const { component, navigate, dialog } = render();
    component.open();

    component.handleInputKeydown(key('Enter'));
    expect(navigate).not.toHaveBeenCalled();
    component.handleInputKeydown(key('ArrowDown'));
    component.handleInputKeydown(key('Enter'));

    expect(navigate).toHaveBeenCalledWith(['/entry', 'dialog']);
    expect(dialog.open).toBe(false);
  });

  it('opens a variant at its fragment', async () => {
    const { component, navigate } = render();

    await component.selectSubcomponent(entries[1], entries[1].subcomponents[0]);

    expect(navigate).toHaveBeenCalledWith(['/entry', 'tabs'], { fragment: 'variant-scrollable' });
  });
});
