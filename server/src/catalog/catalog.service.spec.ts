import { Model } from 'mongoose';
import { StoredEntryDocument } from '../storage/schemas/stored-entry.schema';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  it('escapes special regex characters in a search query', async () => {
    const exec = jest.fn().mockResolvedValue([]);
    const lean = jest.fn().mockReturnValue({ exec });
    const select = jest.fn().mockReturnValue({ lean });
    const find = jest.fn().mockReturnValue({ select });
    const model = { find } as unknown as Model<StoredEntryDocument>;
    const service = new CatalogService(model, model);

    await service.search('dialog.*');

    expect(find).toHaveBeenCalledTimes(2);
    expect(find).toHaveBeenCalledWith({
      $and: [{
        $or: [
          { title: { $regex: 'dialog\\.\\*', $options: 'i' } },
          { summary: { $regex: 'dialog\\.\\*', $options: 'i' } },
          { tags: { $regex: 'dialog\\.\\*', $options: 'i' } },
          { type: { $regex: 'dialog\\.\\*', $options: 'i' } },
          { 'component.variants.title': { $regex: 'dialog\\.\\*', $options: 'i' } },
          { 'component.variants.summary': { $regex: 'dialog\\.\\*', $options: 'i' } },
          { 'component.variants.tags': { $regex: 'dialog\\.\\*', $options: 'i' } }
        ]
      }]
    });
  });

  it('maps component variants to nested catalog subcomponents', async () => {
    const exec = jest.fn().mockResolvedValue([{
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
    }]);
    const lean = jest.fn().mockReturnValue({ exec });
    const select = jest.fn().mockReturnValue({ lean });
    const find = jest.fn().mockReturnValue({ select });
    const model = { find } as unknown as Model<StoredEntryDocument>;
    const service = new CatalogService(model, model);

    const [entry] = await service.search('', 'component');

    expect(entry.subcomponents).toEqual([{
      slug: 'inner-scroll',
      title: 'Inner scroll',
      summary: 'Scroll only the dialog body.',
      tags: ['scroll']
    }]);
    expect(entry).not.toHaveProperty('component');
  });
});
