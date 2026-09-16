import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, effect, inject, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { EntryDetails } from '../../models/library-entry';
import { LibraryApi } from '../../services/library-api';

@Component({
  selector: 'app-details',
  imports: [RouterLink],
  templateUrl: './details.html',
  styleUrl: './details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Details implements OnChanges {
  private readonly api = inject(LibraryApi);
  private readonly contentSections = viewChildren<ElementRef<HTMLElement>>('contentSection');

  @Input({ required: true }) slug = '';
  readonly details = signal<EntryDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly activeSection = signal(0);

  constructor() {
    effect((onCleanup) => {
      const sections = this.contentSections();
      if (!sections.length || typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver((entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset['index']);
        if (Number.isInteger(index)) this.activeSection.set(index);
      }, { rootMargin: '-10% 0px -70% 0px' });

      sections.forEach((section) => observer.observe(section.nativeElement));
      onCleanup(() => observer.disconnect());
    });
  }

  ngOnChanges(): void {
    if (!this.slug) return;
    this.loading.set(true);
    this.error.set('');
    this.activeSection.set(0);
    this.api.getDetails(this.slug).pipe(
      catchError(() => {
        this.error.set('This entry does not exist or the API is unavailable.');
        return of(null);
      })
    ).subscribe((details) => {
      this.details.set(details);
      this.loading.set(false);
    });
  }
}
