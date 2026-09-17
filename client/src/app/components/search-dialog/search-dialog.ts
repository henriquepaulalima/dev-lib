import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
import { CatalogEntry, CatalogSubcomponent } from '../../models/library-entry';
import { LibraryApi } from '../../services/library-api';

@Component({
  selector: 'app-search-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './search-dialog.html',
  styleUrl: './search-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDialog {
  private readonly api = inject(LibraryApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  readonly search = new FormControl('', { nonNullable: true });
  readonly entries = signal<CatalogEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly activeIndex = signal(-1);
  readonly expandedEntries = signal<ReadonlySet<string>>(new Set());

  constructor() {
    this.search.valueChanges.pipe(
      startWith(''),
      debounceTime(180),
      distinctUntilChanged(),
      tap(() => {
        this.loading.set(true);
        this.error.set('');
        this.activeIndex.set(-1);
      }),
      switchMap((query) => this.api.search(query).pipe(
        catchError(() => {
          this.error.set('Search is unavailable. Check that the API is running.');
          return of([]);
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((entries) => {
      this.entries.set(entries.slice(0, 8));
      const query = this.search.value.trim();
      this.expandedEntries.set(new Set(
        query
          ? entries.filter((entry) => entry.subcomponents.some((variant) => this.matches(variant, query))).map((entry) => entry.slug)
          : []
      ));
      this.loading.set(false);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
      event.preventDefault();
      this.dialog().nativeElement.open ? this.close() : this.open();
    }
  }

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) dialog.showModal();
    queueMicrotask(() => this.searchInput().nativeElement.focus());
  }

  close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) dialog.close();
  }

  handleBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  handleInputKeydown(event: KeyboardEvent): void {
    const entries = this.entries();
    if (!entries.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((index) => (index + 1) % entries.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((index) => index <= 0 ? entries.length - 1 : index - 1);
    } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
      event.preventDefault();
      void this.select(entries[this.activeIndex()]);
    }
  }

  async select(entry: CatalogEntry): Promise<void> {
    this.close();
    await this.router.navigate(['/entry', entry.slug]);
  }

  toggleSubcomponents(slug: string): void {
    this.expandedEntries.update((current) => {
      const next = new Set(current);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  isExpanded(slug: string): boolean {
    return this.expandedEntries().has(slug);
  }

  async selectSubcomponent(entry: CatalogEntry, variant: CatalogSubcomponent): Promise<void> {
    this.close();
    await this.router.navigate(['/entry', entry.slug], { fragment: `variant-${variant.slug}` });
  }

  private matches(variant: CatalogSubcomponent, query: string): boolean {
    const haystack = [variant.title, variant.summary, ...variant.tags].join(' ').toLocaleLowerCase();
    return query.toLocaleLowerCase().split(/\s+/).every((term) => haystack.includes(term));
  }
}
