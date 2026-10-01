import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SearchDialog } from './components/search-dialog/search-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SearchDialog],
  template: `
    <header class="site-header" [class.site-header--hidden]="isDetailPage()">
      <a class="brand" routerLink="/" aria-label="Dev Lib home">
        <span class="brand__mark" aria-hidden="true">&lt;/&gt;</span>
        <span class="brand__name">dev/lib</span>
      </a>
      <nav aria-label="Library sections">
        <a routerLink="/components" routerLinkActive="nav__link--active">Components</a>
        <a routerLink="/features" routerLinkActive="nav__link--active">Features</a>
      </nav>
      <app-search-dialog />
    </header>
    <router-outlet />
  `,
  styles: `
    .site-header {
      align-items: center;
      border-bottom: 1px solid var(--border);
      display: grid;
      gap: 1.5rem;
      grid-template-columns: auto 1fr auto;
      margin: 0 auto;
      max-width: var(--page-max-width);
      padding: 1.35rem var(--page-padding);
    }

    .brand {
      align-items: center;
      color: var(--ink);
      display: flex;
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 700;
      gap: 0.7rem;
      letter-spacing: -0.03em;
      text-decoration: none;
    }

    .brand__mark {
      align-items: center;
      background: var(--accent);
      border-radius: 0.55rem;
      color: #08110d;
      display: inline-flex;
      height: 2.15rem;
      justify-content: center;
      letter-spacing: -0.18em;
      padding-right: 0.12rem;
      width: 2.15rem;
    }

    nav {
      align-items: center;
      display: flex;
      gap: 0.25rem;
      justify-content: center;
    }

    nav a {
      border-radius: 0.45rem;
      color: var(--ink-muted);
      font-size: 0.78rem;
      padding: 0.55rem 0.7rem;
      text-decoration: none;
      transition: background-color 160ms, color 160ms;
    }

    nav a:hover,
    nav a.nav__link--active {
      background: var(--surface);
      color: var(--ink);
    }

    @media (max-width: 600px) {
      .site-header { gap: 0.65rem; }
      .brand__name { display: none; }
      nav { gap: 0; }
      nav a { font-size: 0.82rem; min-height: 2.75rem; padding: 0.7rem 0.75rem; }
    }

    @media (max-width: 700px) {
      .site-header--hidden { display: none; }
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly router = inject(Router);
  readonly isDetailPage = signal(this.router.url.startsWith('/entry/'));

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event) => this.isDetailPage.set(event.urlAfterRedirects.startsWith('/entry/')));
  }
}
