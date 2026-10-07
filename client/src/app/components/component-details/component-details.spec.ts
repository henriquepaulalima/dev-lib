import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EntryDetails } from '../../models/library-entry';
import { catalogEntry, componentExample, installBrowserStubs } from '../../testing';
import { ComponentDetails } from './component-details';

describe('ComponentDetails', () => {
  beforeEach(() => {
    installBrowserStubs();
    TestBed.configureTestingModule({ imports: [ComponentDetails], providers: [provideRouter([])] });
  });

  const entry = {
    catalog: catalogEntry(),
    content: {
      slug: 'dialog',
      overview: 'Overview',
      sections: [],
      dependencies: [],
      component: {
        status: 'verified',
        useWhen: 'Use',
        avoidWhen: 'Avoid',
        examples: [componentExample()],
        variants: [{ slug: 'inner-scroll', title: 'Inner scroll', summary: 'Scroll body', tags: [], useWhen: '', avoidWhen: '', customization: [], example: componentExample() }],
        anatomy: [{ name: 'Backdrop', description: 'Dims the page' }],
        tokens: [],
        accessibility: [],
        responsive: '',
        limitations: [],
        provenance: { label: 'Original', note: '' }
      }
    }
  } as unknown as EntryDetails;

  function render(fragment: string | null = null) {
    const fixture = TestBed.createComponent(ComponentDetails);
    fixture.componentRef.setInput('entry', entry);
    fixture.componentRef.setInput('fragment', fragment);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('selects the variant named in the fragment, ignoring section suffixes', () => {
    expect(render('variant-inner-scroll').component.activeVariant()?.title).toBe('Inner scroll');
    expect(render('variant-inner-scroll--examples').component.activeVariant()?.slug).toBe('inner-scroll');
  });

  it('shows the base component for other or unknown fragments', () => {
    expect(render('anatomy').component.activeVariant()).toBeNull();
    expect(render('variant-missing').component.activeVariant()).toBeNull();
    expect(render().component.activeVariant()).toBeNull();
  });

  it('renders anatomy items by name and description', () => {
    const text = render().fixture.nativeElement.textContent;

    expect(text).toContain('Backdrop');
    expect(text).toContain('Dims the page');
  });

  it('tracks the active page section and closes menus', () => {
    const { component } = render();
    component.variantMenuOpen.set(true);
    component.sessionMenuOpen.set(true);

    component.closeMenus();

    expect(component.isPageSectionActive('examples')).toBe(true);
    expect(component.variantMenuOpen()).toBe(false);
    expect(component.sessionMenuOpen()).toBe(false);
  });
});
