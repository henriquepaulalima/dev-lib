import { Model } from 'mongoose';
import { StoredEntryDocument } from '../storage/schemas/stored-entry.schema';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  const dialog = {
    slug: 'accessible-dialog',
    type: 'component',
    title: 'Dialog',
    summary: 'A native dialog pattern.',
    tags: ['dialog'],
    component: {
      variants: [{
        slug: 'inner-scroll',
        title: 'Inner scroll',
        summary: 'Scroll only the dialog body.',
        tags: ['scroll']
      }]
    }
  };
  const websocket = {
    slug: 'websocket',
    type: 'feature',
    title: 'WebSocket client',
    summary: 'Reconnecting socket (with backoff).',
    tags: ['realtime']
  };

  function createService(components: unknown[] = [dialog], features: unknown[] = [websocket]) {
    const model = (documents: unknown[]) => {
      const exec = jest.fn().mockResolvedValue(documents);
      const find = jest.fn().mockReturnValue({ select: () => ({ lean: () => ({ exec }) }) });
      return { find } as unknown as Model<StoredEntryDocument>;
    };
    const componentModel = model(components);
    const featureModel = model(features);
    return { service: new CatalogService(componentModel, featureModel), componentModel, featureModel };
  }

  it('maps component variants to nested catalog subcomponents', async () => {
    const { service } = createService();

    const [entry] = await service.search('', 'component');

    expect(entry.subcomponents).toEqual(dialog.component.variants);
    expect(entry).not.toHaveProperty('component');
  });

  it('matches every term case-insensitively across titles, tags and variants', async () => {
    const { service } = createService();

    expect((await service.search('DIALOG scroll')).map((entry) => entry.slug)).toEqual(['accessible-dialog']);
    expect((await service.search('realtime')).map((entry) => entry.slug)).toEqual(['websocket']);
    expect(await service.search('dialog realtime')).toEqual([]);
  });

  it('treats regex characters in a query literally', async () => {
    const { service } = createService();

    expect((await service.search('(with')).map((entry) => entry.slug)).toEqual(['websocket']);
    expect(await service.search('dialog.*')).toEqual([]);
  });

  it('ignores search terms beyond the fifth', async () => {
    const { service } = createService();

    expect((await service.search('dialog dialog dialog dialog dialog missing')).map((entry) => entry.slug))
      .toEqual(['accessible-dialog']);
  });

  it('reads the catalog from MongoDB once', async () => {
    const { service, componentModel, featureModel } = createService();

    await service.search('dialog');
    await service.search('', 'feature');
    await service.findBySlug('websocket');

    expect(componentModel.find).toHaveBeenCalledTimes(1);
    expect(featureModel.find).toHaveBeenCalledTimes(1);
  });

  it('rejects unknown slugs', async () => {
    const { service } = createService();

    await expect(service.findBySlug('missing')).rejects.toThrow('Catalog entry "missing" was not found.');
  });
});
