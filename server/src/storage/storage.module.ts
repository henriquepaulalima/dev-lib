import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  COMPONENT_MODEL,
  FEATURE_MODEL,
  StoredEntrySchema
} from './schemas/stored-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COMPONENT_MODEL, schema: StoredEntrySchema, collection: 'component' },
      { name: FEATURE_MODEL, schema: StoredEntrySchema, collection: 'feature' }
    ])
  ],
  exports: [MongooseModule]
})
export class StorageModule {}

