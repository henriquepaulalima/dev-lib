import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const COMPONENT_MODEL = 'ComponentEntry';
export const FEATURE_MODEL = 'FeatureEntry';
export type EntryType = 'component' | 'feature';

export type StoredEntryDocument = HydratedDocument<StoredEntry>;

@Schema({ _id: false })
export class StoredSection {
  @Prop({ required: true })
  heading: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  code?: string;

  @Prop()
  language?: string;
}

export const StoredSectionSchema = SchemaFactory.createForClass(StoredSection);

@Schema({ _id: false })
export class StoredComponentExampleSource {
  @Prop({ required: true })
  html: string;

  @Prop({ required: true })
  css: string;

  @Prop({ required: true })
  javascript: string;

  @Prop()
  typescript?: string;
}

const StoredComponentExampleSourceSchema = SchemaFactory.createForClass(StoredComponentExampleSource);

@Schema({ _id: false })
export class StoredComponentExample {
  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: StoredComponentExampleSourceSchema })
  source: StoredComponentExampleSource;

  @Prop()
  canvasHeight?: number;
}

const StoredComponentExampleSchema = SchemaFactory.createForClass(StoredComponentExample);

@Schema({ _id: false })
export class StoredComponentVariant {
  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ default: [], type: [String] })
  tags: string[];

  @Prop({ required: true })
  useWhen: string;

  @Prop({ required: true })
  avoidWhen: string;

  @Prop({ default: [], type: [String] })
  customization: string[];

  @Prop({ required: true, type: StoredComponentExampleSchema })
  example: StoredComponentExample;
}

const StoredComponentVariantSchema = SchemaFactory.createForClass(StoredComponentVariant);

@Schema({ _id: false })
export class StoredComponentAnatomyItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;
}

const StoredComponentAnatomyItemSchema = SchemaFactory.createForClass(StoredComponentAnatomyItem);

@Schema({ _id: false })
export class StoredComponentToken {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  defaultValue: string;

  @Prop({ required: true })
  description: string;
}

const StoredComponentTokenSchema = SchemaFactory.createForClass(StoredComponentToken);

@Schema({ _id: false })
export class StoredComponentProvenance {
  @Prop({ required: true, trim: true })
  label: string;

  @Prop()
  url?: string;

  @Prop({ required: true })
  note: string;
}

const StoredComponentProvenanceSchema = SchemaFactory.createForClass(StoredComponentProvenance);

@Schema({ _id: false })
export class StoredComponentContent {
  @Prop({ enum: ['draft', 'verified'], required: true })
  status: 'draft' | 'verified';

  @Prop({ required: true })
  useWhen: string;

  @Prop({ required: true })
  avoidWhen: string;

  @Prop({ default: [], type: [StoredComponentExampleSchema] })
  examples: StoredComponentExample[];

  @Prop({ default: [], type: [StoredComponentVariantSchema] })
  variants: StoredComponentVariant[];

  @Prop({ default: [], type: [StoredComponentAnatomyItemSchema] })
  anatomy: StoredComponentAnatomyItem[];

  @Prop({ default: [], type: [StoredComponentTokenSchema] })
  tokens: StoredComponentToken[];

  @Prop({ default: [], type: [String] })
  accessibility: string[];

  @Prop({ required: true })
  responsive: string;

  @Prop({ default: [], type: [String] })
  limitations: string[];

  @Prop({ required: true, type: StoredComponentProvenanceSchema })
  provenance: StoredComponentProvenance;
}

const StoredComponentContentSchema = SchemaFactory.createForClass(StoredComponentContent);

@Schema({ _id: false })
export class StoredFeatureGuide {
  @Prop({ required: true }) introduction: string;
  @Prop({ default: [], type: [String] }) dependencies: string[];
  @Prop({ default: [], type: [StoredSectionSchema] }) sections: StoredSection[];
}
const StoredFeatureGuideSchema = SchemaFactory.createForClass(StoredFeatureGuide);

@Schema({ _id: false })
export class StoredFeatureGuides {
  @Prop({ type: StoredFeatureGuideSchema, required: true }) javascript: StoredFeatureGuide;
  @Prop({ type: StoredFeatureGuideSchema, required: true }) typescript: StoredFeatureGuide;
  @Prop({ type: StoredFeatureGuideSchema, required: true }) go: StoredFeatureGuide;
  @Prop({ type: StoredFeatureGuideSchema, required: true }) csharp: StoredFeatureGuide;
}
const StoredFeatureGuidesSchema = SchemaFactory.createForClass(StoredFeatureGuides);

@Schema({ _id: false })
export class StoredFeatureVariant {
  @Prop({ required: true }) slug: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) summary: string;
  @Prop({ type: StoredFeatureGuidesSchema, required: true }) guides: StoredFeatureGuides;
}
const StoredFeatureVariantSchema = SchemaFactory.createForClass(StoredFeatureVariant);

@Schema({ _id: false })
export class StoredFeatureSource {
  @Prop({ required: true }) label: string;
  @Prop({ required: true }) url: string;
}
const StoredFeatureSourceSchema = SchemaFactory.createForClass(StoredFeatureSource);

@Schema({ _id: false })
export class StoredFeatureContent {
  @Prop({ default: [], type: [StoredFeatureVariantSchema] }) variants: StoredFeatureVariant[];
  @Prop({ default: [], type: [StoredFeatureSourceSchema] }) sources: StoredFeatureSource[];
}
const StoredFeatureContentSchema = SchemaFactory.createForClass(StoredFeatureContent);

@Schema({ versionKey: false })
export class StoredEntry {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ enum: ['component', 'feature'], required: true })
  type: EntryType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ default: [], type: [String] })
  tags: string[];

  @Prop({ required: true })
  overview: string;

  @Prop({ default: [], type: [StoredSectionSchema] })
  sections: StoredSection[];

  @Prop({ default: [], type: [String] })
  dependencies: string[];

  @Prop({ type: StoredComponentContentSchema })
  component?: StoredComponentContent;

  @Prop({ type: StoredFeatureContentSchema })
  feature?: StoredFeatureContent;
}

export const StoredEntrySchema = SchemaFactory.createForClass(StoredEntry);
StoredEntrySchema.index({ title: 'text', summary: 'text', tags: 'text' });
