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

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(COMPONENT_MODEL)
    private readonly componentModel: Model<StoredEntryDocument>,
    @InjectModel(FEATURE_MODEL)
    private readonly featureModel: Model<StoredEntryDocument>
  ) {}

  async search(query = '', type?: string): Promise<CatalogSummary[]> {
    const normalizedQuery = query.trim().slice(0, 100);
    const filter: Record<string, unknown> = {};

    if (type === 'component' || type === 'feature') filter['type'] = type;

    if (normalizedQuery) {
      const terms = normalizedQuery.split(/\s+/).filter(Boolean).map(this.escapeRegex);
      filter['$and'] = terms.map((term) => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { summary: { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
          { type: { $regex: term, $options: 'i' } },
          { 'component.variants.title': { $regex: term, $options: 'i' } },
          { 'component.variants.summary': { $regex: term, $options: 'i' } },
          { 'component.variants.tags': { $regex: term, $options: 'i' } }
        ]
      }));
    }

    const models = type === 'component'
      ? [this.componentModel]
      : type === 'feature'
        ? [this.featureModel]
        : [this.componentModel, this.featureModel];
    delete filter['type'];

    const results = await Promise.all(models.map((model) => model
      .find(filter)
      .select('-_id slug type title summary tags component.variants.slug component.variants.title component.variants.summary component.variants.tags')
      .lean<CatalogDocument[]>()
      .exec()));
    const entries = results.flat().map((document) => this.toSummary(document));

    return entries.sort((left, right) => this.relevance(right, normalizedQuery) - this.relevance(left, normalizedQuery)
      || left.title.localeCompare(right.title));
  }

  async findBySlug(slug: string): Promise<CatalogSummary> {
    const [component, feature] = await Promise.all([
      this.componentModel.findOne({ slug })
        .select('-_id slug type title summary tags component.variants.slug component.variants.title component.variants.summary component.variants.tags')
        .lean<CatalogDocument>()
        .exec(),
      this.featureModel.findOne({ slug }).select('-_id slug type title summary tags').lean<CatalogDocument>().exec()
    ]);
    const entry = component ?? feature;

    if (!entry) throw new NotFoundException(`Catalog entry "${slug}" was not found.`);
    return this.toSummary(entry);
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

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toSummary({ component, ...entry }: CatalogDocument): CatalogSummary {
    return { ...entry, subcomponents: component?.variants ?? [] };
  }
}
