import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { BackLink } from './components/back-link/back-link';
import { Home } from './pages/home/home';
import { LibraryApi } from './services/library-api';
import { installBrowserStubs } from './testing';

@Component({ template: '' })
class Blank {}

describe('App', () => {
  beforeEach(() => {
    installBrowserStubs();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: '', component: Blank }, { path: 'entry/:slug', component: Blank }]),
        { provide: LibraryApi, useValue: { search: () => of([]) } }
      ]
    });
  });

  it('hides the site header on entry pages', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const header = () => fixture.nativeElement.querySelector('.site-header') as HTMLElement;

    await router.navigateByUrl('/entry/dialog');
    fixture.detectChanges();
    expect(fixture.componentInstance.isDetailPage()).toBe(true);
    expect(header().classList).toContain('site-header--hidden');

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(header().classList).not.toContain('site-header--hidden');
  });

  it('links to the component and feature collections', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const links = [...fixture.nativeElement.querySelectorAll('nav a')].map((link) => (link as HTMLAnchorElement).getAttribute('href'));
    expect(links).toEqual(['/components', '/features']);
  });
});

describe('BackLink and Home', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('renders a back link to its target', () => {
    const fixture = TestBed.createComponent(BackLink);
    fixture.componentRef.setInput('target', '/components');
    fixture.componentRef.setInput('label', 'Components');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/components');
    expect(link.textContent).toContain('Components');
  });

  it('links the home page to both collections', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    const links = [...fixture.nativeElement.querySelectorAll('a')].map((link) => (link as HTMLAnchorElement).getAttribute('href'));
    expect(links).toEqual(expect.arrayContaining(['/components', '/features']));
  });
});
