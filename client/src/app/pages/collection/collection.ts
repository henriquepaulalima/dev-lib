import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CatalogEntry, EntryType } from '../../models/library-entry';
import { LibraryApi } from '../../services/library-api';

@Component({
  selector: 'app-collection',
  imports: [RouterLink],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Collection {
  private readonly api = inject(LibraryApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly entryType = this.route.snapshot.data['entryType'] as EntryType;
  readonly heading = this.route.snapshot.data['heading'] as string;
  readonly description = this.route.snapshot.data['description'] as string;
  readonly entries = signal<CatalogEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.api.search('', this.entryType).pipe(
      catchError(() => {
        this.error.set(`The ${this.heading.toLocaleLowerCase()} could not be loaded. Check that the API is running.`);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((entries) => {
      this.entries.set(entries);
      this.loading.set(false);
    });
  }
}

