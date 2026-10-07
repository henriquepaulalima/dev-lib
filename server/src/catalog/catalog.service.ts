import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  COMPONENT_MODEL,
  EntryType,
  FEATURE_MODEL,
  StoredEntryDocument
} from '../storage/schemas/stored-entry.schema';

export interface CatalogSummary {
  slug: string;
  type: EntryType;
  title: string;
  summary: string;
  tags: string[];
  subcomponents: CatalogSubcomponentSummary[];
}

export interface CatalogSubcomponentSummary {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
}

type CatalogDocument = Omit<CatalogSummary, 'subcomponents'> & {
  component?: { variants?: CatalogSubcomponentSummary[] };
};

const MAX_SEARCH_TERMS = 5;

@Injectable()
export class CatalogService {
  // The catalog only changes when the server seeds MongoDB on startup, so it is read once per process.
  private entries: Promise<CatalogSummary[]> | null = null;

  constructor(
    @InjectModel(COMPONENT_MODEL)
    private readonly componentModel: Model<StoredEntryDocument>,
    @InjectModel(FEATURE_MODEL)
    private readonly featureModel: Model<StoredEntryDocument>
  ) {}

  async search(query = '', type?: string): Promise<CatalogSummary[]> {
    const normalizedQuery = query.trim().slice(0, 100);
    const terms = normalizedQuery.split(/\s+/).filter(Boolean).slice(0, MAX_SEARCH_TERMS)
      .map((term) => term.toLocaleLowerCase());
    const entries = (await this.loadEntries())
      .filter((entry) => type !== 'component' && type !== 'feature' || entry.type === type)
      .filter((entry) => terms.every((term) => this.searchableText(entry).some((text) => text.includes(term))));

    return entries.sort((left, right) => this.relevance(right, normalizedQuery) - this.relevance(left, normalizedQuery)
      || left.title.localeCompare(right.title));
  }

  async findBySlug(slug: string): Promise<CatalogSummary> {
    const entry = (await this.loadEntries()).find((candidate) => candidate.slug === slug);

    if (!entry) throw new NotFoundException(`Catalog entry "${slug}" was not found.`);
    return entry;
  }

  private loadEntries(): Promise<CatalogSummary[]> {
    if (!this.entries) {
      const entries = Promise.all([
        this.componentModel.find()
          .select('-_id slug type title summary tags component.variants.slug component.variants.title component.variants.summary component.variants.tags')
          .lean<CatalogDocument[]>()
          .exec(),
        this.featureModel.find().select('-_id slug type title summary tags').lean<CatalogDocument[]>().exec()
      ]).then((results) => results.flat().map((document) => this.toSummary(document)));
      entries.catch(() => {
        this.entries = null;
      });
      this.entries = entries;
    }
    return this.entries;
  }

  private searchableText(entry: CatalogSummary): string[] {
    return [
      entry.title,
      entry.summary,
      entry.type,
      ...entry.tags,
      ...entry.subcomponents.flatMap((variant) => [variant.title, variant.summary, ...variant.tags])
    ].map((text) => text.toLocaleLowerCase());
  }

  private relevance(entry: CatalogSummary, query: string): number {
    if (!query) return 0;
    const needle = query.toLocaleLowerCase();
    const title = entry.title.toLocaleLowerCase();
    if (title === needle) return 100;
    if (title.startsWith(needle)) return 50;
    if (entry.tags.some((tag) => tag.toLocaleLowerCase() === needle)) return 25;
    if (entry.subcomponents.some((variant) => variant.title.toLocaleLowerCase() === needle)) return 20;
    if (title.includes(needle)) return 10;
    return 1;
  }

  private toSummary({ component, ...entry }: CatalogDocument): CatalogSummary {
    return { ...entry, subcomponents: component?.variants ?? [] };
  }
}
