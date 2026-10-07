import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { model } from 'mongoose';
import { StoredEntrySchema } from './schemas/stored-entry.schema';

// The server seeds MongoDB from /db on every start and refuses to start if seeding fails,
// so every entry is checked here before it can reach a deployment.
const dbRoot = join(__dirname, '../../../db');
const SeedEntry = model('SeedEntry', StoredEntrySchema);
const collections = readdirSync(dbRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const entries = collections.flatMap((collection) => readdirSync(join(dbRoot, collection))
  .filter((file) => file.endsWith('.data.json'))
  .flatMap((file) => {
    const parsed: unknown = JSON.parse(readFileSync(join(dbRoot, collection, file), 'utf8'));
    if (!Array.isArray(parsed)) throw new Error(`db/${collection}/${file} must contain a JSON array`);
    return parsed.map((document: Record<string, unknown>) => ({ collection, file, document }));
  }));

describe('seed data', () => {
  it('only contains the component and feature collections', () => {
    expect(collections.sort()).toEqual(['component', 'feature']);
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries.map((entry) => [`${entry.collection}/${entry.document['slug']}`, entry]))('%s matches the schema', async (_name, { collection, document }) => {
    await expect(new SeedEntry(document).validate()).resolves.toBeUndefined();
    expect(document['type']).toBe(collection);
    expect(Object.keys(document).filter((key) => !(key in StoredEntrySchema.paths))).toEqual([]);
    expect(document[collection]).toBeDefined();
  });

  it('uses unique slugs across collections', () => {
    const slugs = entries.map(({ document }) => document['slug']);

    expect(slugs.filter((slug, index) => slugs.indexOf(slug) !== index)).toEqual([]);
  });

  it('uses unique variant slugs within each entry', () => {
    for (const { document } of entries) {
      const variants = ((document['component'] ?? document['feature']) as { variants?: { slug: string }[] }).variants ?? [];
      const slugs = variants.map((variant) => variant.slug);

      expect({ entry: document['slug'], duplicates: slugs.filter((slug, index) => slugs.indexOf(slug) !== index) })
        .toEqual({ entry: document['slug'], duplicates: [] });
    }
  });
});
