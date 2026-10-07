import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { EntryDetails } from '../../models/library-entry';
import { LibraryApi } from '../../services/library-api';
import { featureDetails, installBrowserStubs } from '../../testing';
import { Details } from './details';

describe('Details', () => {
  let writeText: ReturnType<typeof vi.fn>;
  const fragment = new BehaviorSubject<string | null>(null);

  beforeEach(() => {
    ({ writeText } = installBrowserStubs());
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => callback(0));
  });
  afterEach(() => vi.unstubAllGlobals());

  function render(getDetails: LibraryApi['getDetails'] = () => of(featureDetails())) {
    TestBed.configureTestingModule({
      imports: [Details],
      providers: [provideRouter([]), { provide: LibraryApi, useValue: { getDetails: vi.fn(getDetails) } }, { provide: ActivatedRoute, useValue: { fragment } }]
    });
    const fixture = TestBed.createComponent(Details);
    const component = fixture.componentInstance;
    component.slug = 'websocket';
    component.ngOnChanges();
    return { fixture, component, api: TestBed.inject(LibraryApi) };
  }
  const headings = (component: Details) => component.sections().map((section) => section.heading);

  it('loads the entry and selects the first feature variant', () => {
    const { component, api } = render();

    expect(api.getDetails).toHaveBeenCalledWith('websocket');
    expect(component.loading()).toBe(false);
    expect(component.activeVariant()).toBe('reconnect');
    expect(headings(component)).toEqual(['reconnect js']);
  });

  it('does nothing without a slug', () => {
    const { component, api } = render();
    vi.mocked(api.getDetails).mockClear();

    component.slug = '';
    component.ngOnChanges();

    expect(api.getDetails).not.toHaveBeenCalled();
  });

  it('shows the guide for the selected language and variant', () => {
    const { component } = render();

    component.selectLanguage('go');
    expect(headings(component)).toEqual(['reconnect go']);
    component.selectVariant('heartbeat');
    expect(headings(component)).toEqual(['heartbeat go']);
  });

  it('switches language from the select element and ignores unknown values', () => {
    const { component } = render();
    const select = document.createElement('select');
    select.innerHTML = '<option value="csharp"></option><option value="cobol"></option>';

    select.value = 'csharp';
    component.onLanguageChange({ target: select } as unknown as Event);
    expect(component.activeLanguage()).toBe('csharp');
    select.value = 'cobol';
    component.onLanguageChange({ target: select } as unknown as Event);
    expect(component.activeLanguage()).toBe('csharp');
  });

  it('highlights known languages and falls back to plain text', () => {
    const { component } = render();

    expect(component.highlightedSections()[0].highlightedCode).toContain('hljs-keyword');
    component.selectLanguage('csharp');
    expect(component.highlightedSections()[0].highlightedCode).toBe('var a = 1;');
  });

  it('uses the entry sections when it has no feature guides', () => {
    const details = featureDetails();
    const { component } = render(() => of({ ...details, content: { ...details.content, feature: undefined } } as EntryDetails));

    expect(headings(component)).toEqual(['Fallback']);
  });

  it('shows an error for missing entries', () => {
    const { component } = render(() => throwError(() => new Error('404')));

    expect(component.error()).toBe('This entry does not exist or the API is unavailable.');
    expect(component.details()).toBeNull();
  });

  it('copies code and clears the status after a moment', async () => {
    vi.useFakeTimers();
    const { component } = render();
    const section = component.sections()[0];

    await component.copyCode(section, 0);
    expect(writeText).toHaveBeenCalledWith('const a = 1;');
    expect(component.copyStatus()).toEqual({ section: 0, state: 'copied' });
    vi.advanceTimersByTime(1800);
    expect(component.copyStatus()).toBeNull();
    vi.useRealTimers();
  });

  it('reports copy failures and ignores sections without code', async () => {
    const { component } = render();
    writeText.mockRejectedValueOnce(new Error('denied'));

    await component.copyCode(component.sections()[0], 0);
    expect(component.copyStatus()).toEqual({ section: 0, state: 'error' });
    writeText.mockClear();
    await component.copyCode({ heading: 'No code', body: '' }, 1);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('follows the route fragment', () => {
    const { component } = render();

    fragment.next('setup');

    expect(component.fragment()).toBe('setup');
  });
});
