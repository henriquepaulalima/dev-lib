import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  COMPONENT_MODEL,
  FEATURE_MODEL,
  StoredEntryDocument,
  StoredSection,
  StoredComponentContent,
  StoredFeatureContent
} from '../storage/schemas/stored-entry.schema';

export interface LibraryContentView {
  slug: string;
  overview: string;
  sections: StoredSection[];
  dependencies: string[];
  component?: StoredComponentContent;
  feature?: StoredFeatureContent;
}

@Injectable()
export class LibraryService {
  // Content only changes when the server seeds MongoDB on startup, so known slugs and loaded entries are kept per process.
  private slugs: Promise<Set<string>> | null = null;
  private readonly contents = new Map<string, Promise<LibraryContentView | null>>();

  constructor(
    @InjectModel(COMPONENT_MODEL)
    private readonly componentModel: Model<StoredEntryDocument>,
    @InjectModel(FEATURE_MODEL)
    private readonly featureModel: Model<StoredEntryDocument>
  ) {}

  async findBySlug(slug: string): Promise<LibraryContentView> {
    const content = (await this.knownSlugs()).has(slug) ? await this.loadContent(slug) : null;

    if (!content) throw new NotFoundException(`Library content "${slug}" was not found.`);
    return content;
  }

  private knownSlugs(): Promise<Set<string>> {
    if (!this.slugs) {
      const slugs = Promise.all([
        this.componentModel.distinct('slug').exec() as Promise<string[]>,
        this.featureModel.distinct('slug').exec() as Promise<string[]>
      ]).then((results) => new Set(results.flat()));
      slugs.catch(() => {
        this.slugs = null;
      });
      this.slugs = slugs;
    }
    return this.slugs;
  }

  private loadContent(slug: string): Promise<LibraryContentView | null> {
    let content = this.contents.get(slug);

    if (!content) {
      content = Promise.all([
        this.componentModel.findOne({ slug }).select('-_id slug overview sections dependencies component').lean<LibraryContentView>().exec(),
        this.featureModel.findOne({ slug }).select('-_id slug overview sections dependencies feature').lean<LibraryContentView>().exec()
      ]).then(([component, feature]) => {
        const entry = component ?? feature;
        if (entry?.component) entry.component.variants ??= [];
        return entry;
      });
      content.catch(() => this.contents.delete(slug));
      this.contents.set(slug, content);
    }

    return content;
  }
}
