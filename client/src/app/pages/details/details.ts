import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, computed, effect, inject, signal, viewChildren } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import javascript from 'highlight.js/lib/languages/javascript';
import plaintext from 'highlight.js/lib/languages/plaintext';
import typescript from 'highlight.js/lib/languages/typescript';
import { catchError, of } from 'rxjs';
import { ComponentDetails } from '../../components/component-details/component-details';
import { BackLink } from '../../components/back-link/back-link';
import { ContentSection, EntryDetails, FeatureLanguage } from '../../models/library-entry';
import { LibraryApi } from '../../services/library-api';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('typescript', typescript);

const codeLanguages: Record<string, string> = {
  shell: 'bash',
  bash: 'bash',
  csharp: 'csharp',
  go: 'go',
  javascript: 'javascript',
  typescript: 'typescript'
};

@Component({
  selector: 'app-details',
  imports: [RouterLink, ComponentDetails, BackLink],
  templateUrl: './details.html',
  styleUrl: './details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Details implements OnChanges {
  private readonly api = inject(LibraryApi);
  private readonly route = inject(ActivatedRoute);
  private readonly contentSections = viewChildren<ElementRef<HTMLElement>>('contentSection');

  @Input({ required: true }) slug = '';
  readonly details = signal<EntryDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly activeSection = signal(0);
  readonly fragment = signal<string | null>(null);
  readonly menuOpen = signal(false);
  readonly variantMenuOpen = signal(false);
  readonly copyStatus = signal<{ section: number; state: 'copied' | 'error' } | null>(null);
  private copyResetTimer?: ReturnType<typeof setTimeout>;
  private copyRequest = 0;
  readonly languages: { id: FeatureLanguage; label: string }[] = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'go', label: 'Go' },
    { id: 'csharp', label: 'C#' }
  ];
  readonly activeLanguage = signal<FeatureLanguage>('javascript');
  readonly activeVariant = signal('');
  readonly variant = computed(() => this.details()?.content.feature?.variants.find((item) => item.slug === this.activeVariant()));
  readonly guide = computed(() => this.variant()?.guides[this.activeLanguage()]);
  readonly sections = computed(() => this.guide()?.sections ?? this.details()?.content.sections ?? []);
  readonly highlightedSections = computed(() => this.sections().map((section) => ({
    ...section,
    highlightedCode: section.code ? this.highlightCode(section) : ''
  })));

  constructor() {
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => this.fragment.set(fragment));

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
    this.activeLanguage.set('javascript');
    this.activeVariant.set('');
    this.clearCopyStatus();
    this.api.getDetails(this.slug).pipe(
      catchError(() => {
        this.error.set('This entry does not exist or the API is unavailable.');
        return of(null);
      })
    ).subscribe((details) => {
      this.details.set(details);
      this.activeVariant.set(details?.content.feature?.variants[0]?.slug ?? '');
      this.loading.set(false);
    });
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.variantMenuOpen.set(false);
  }

  selectLanguage(language: FeatureLanguage): void {
    this.activeLanguage.set(language);
    this.activeSection.set(0);
    this.clearCopyStatus();
    this.closeMenu();
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const language = this.languages.find((option) => option.id === select.value);
    if (language) {
      this.selectLanguage(language.id);
      select.blur();
    }
  }

  selectVariant(slug: string): void {
    if (this.activeVariant() === slug) {
      this.closeMenu();
      return;
    }
    this.activeVariant.set(slug);
    this.activeSection.set(0);
    this.clearCopyStatus();
    this.closeMenu();
    requestAnimationFrame(() => {
      this.contentSections()[0]?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async copyCode(section: ContentSection, index: number): Promise<void> {
    if (!section.code) return;
    this.clearCopyStatus();
    const request = this.copyRequest;
    try {
      await navigator.clipboard.writeText(section.code);
      if (request !== this.copyRequest) return;
      this.copyStatus.set({ section: index, state: 'copied' });
    } catch {
      if (request !== this.copyRequest) return;
      this.copyStatus.set({ section: index, state: 'error' });
    }
    this.copyResetTimer = setTimeout(() => this.copyStatus.set(null), 1800);
  }

  private clearCopyStatus(): void {
    this.copyRequest++;
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
    this.copyStatus.set(null);
  }

  private highlightCode(section: ContentSection): string {
    return hljs.highlight(section.code ?? '', {
      language: codeLanguages[section.language ?? ''] ?? 'plaintext'
    }).value;
  }
}
