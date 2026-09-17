export type EntryType = 'component' | 'feature';

export interface CatalogEntry {
  slug: string;
  type: EntryType;
  title: string;
  summary: string;
  tags: string[];
  subcomponents: CatalogSubcomponent[];
}

export interface CatalogSubcomponent {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
}

export interface ContentSection {
  heading: string;
  body: string;
  code?: string;
  language?: string;
}

export interface ComponentExampleSource {
  html: string;
  css: string;
  javascript: string;
  typescript?: string;
}

export interface ComponentExample {
  slug: string;
  title: string;
  description: string;
  source: ComponentExampleSource;
  canvasHeight?: number;
}

export interface ComponentAnatomyItem {
  name: string;
  description: string;
}

export interface ComponentToken {
  name: string;
  defaultValue: string;
  description: string;
}

export interface ComponentProvenance {
  label: string;
  url?: string;
  note: string;
}

export interface ComponentVariant {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  useWhen: string;
  avoidWhen: string;
  customization: string[];
  example: ComponentExample;
}

export interface ComponentContent {
  status: 'draft' | 'verified';
  useWhen: string;
  avoidWhen: string;
  examples: ComponentExample[];
  variants: ComponentVariant[];
  anatomy: ComponentAnatomyItem[];
  tokens: ComponentToken[];
  accessibility: string[];
  responsive: string;
  limitations: string[];
  provenance: ComponentProvenance;
}

export interface LibraryContent {
  slug: string;
  overview: string;
  sections: ContentSection[];
  dependencies: string[];
  component?: ComponentContent;
}

export interface EntryDetails {
  catalog: CatalogEntry;
  content: LibraryContent;
}
