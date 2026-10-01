import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EntryDetails } from '../../models/library-entry';
import { ComponentPreview } from '../component-preview/component-preview';
import { BackLink } from '../back-link/back-link';

@Component({
  selector: 'app-component-details',
  imports: [RouterLink, ComponentPreview, BackLink],
  templateUrl: './component-details.html',
  styleUrl: './component-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentDetails {
  private readonly pageSections = viewChildren<ElementRef<HTMLElement>>('pageSection');

  readonly entry = input.required<EntryDetails>();
  readonly fragment = input<string | null>(null);
  readonly activePageSection = signal('examples');
  readonly variantMenuOpen = signal(false);
  readonly sessionMenuOpen = signal(false);
  readonly activeVariant = computed(() => {
    const fragment = this.fragment();
    if (!fragment?.startsWith('variant-')) return null;
    const slug = fragment.slice('variant-'.length).split('--')[0];
    return this.entry().content.component?.variants.find((variant) => variant.slug === slug) ?? null;
  });

  constructor() {
    effect(() => {
      this.entry();
      const fragment = this.fragment();
      if (typeof document === 'undefined' || !fragment) return;

      window.setTimeout(() => {
        const target = document.getElementById(fragment);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    effect((onCleanup) => {
      const sections = this.pageSections();
      if (!sections.length || typeof IntersectionObserver === 'undefined') return;

      const fragment = this.fragment();
      const initialSection = sections.find((section) => section.nativeElement.id === fragment) ?? sections[0];
      this.activePageSection.set(initialSection.nativeElement.id);

      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top));
        const current = visible[0];
        if (current?.target instanceof HTMLElement && current.target.id) {
          this.activePageSection.set(current.target.id);
        }
      }, { rootMargin: '-14% 0px -72% 0px' });

      sections.forEach((section) => observer.observe(section.nativeElement));
      onCleanup(() => observer.disconnect());
    });
  }

  isPageSectionActive(target: string): boolean {
    return this.activePageSection() === target;
  }

  closeMenus(): void {
    this.variantMenuOpen.set(false);
    this.sessionMenuOpen.set(false);
  }
}
