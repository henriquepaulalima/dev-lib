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
  constructor(
    @InjectModel(COMPONENT_MODEL)
    private readonly componentModel: Model<StoredEntryDocument>,
    @InjectModel(FEATURE_MODEL)
    private readonly featureModel: Model<StoredEntryDocument>
  ) {}

  async findBySlug(slug: string): Promise<LibraryContentView> {
    const [component, feature] = await Promise.all([
      this.componentModel.findOne({ slug }).select('-_id slug overview sections dependencies component').lean<LibraryContentView>().exec(),
      this.featureModel.findOne({ slug }).select('-_id slug overview sections dependencies feature').lean<LibraryContentView>().exec()
    ]);
    const content = component ?? feature;

    if (!content) throw new NotFoundException(`Library content "${slug}" was not found.`);
    if (content.component) content.component.variants ??= [];
    return content;
  }

}
