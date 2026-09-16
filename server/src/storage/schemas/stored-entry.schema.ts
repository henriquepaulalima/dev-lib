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
}

export const StoredEntrySchema = SchemaFactory.createForClass(StoredEntry);
StoredEntrySchema.index({ title: 'text', summary: 'text', tags: 'text' });
