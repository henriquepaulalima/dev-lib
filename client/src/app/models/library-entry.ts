export type EntryType = 'component' | 'feature';

export interface CatalogEntry {
  slug: string;
  type: EntryType;
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

export interface LibraryContent {
  slug: string;
  overview: string;
  sections: ContentSection[];
  dependencies: string[];
}

export interface EntryDetails {
  catalog: CatalogEntry;
  content: LibraryContent;
}
