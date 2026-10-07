import { Model } from 'mongoose';
import { StoredEntryDocument } from '../storage/schemas/stored-entry.schema';
import { LibraryService } from './library.service';

describe('LibraryService', () => {
  function createModel(slugs: string[], documents: Record<string, unknown>) {
    return {
      distinct: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(slugs) }),
      findOne: jest.fn(({ slug }: { slug: string }) => ({
        select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue(documents[slug] ?? null) }) })
      }))
    };
  }

  function createService() {
    const componentModel = createModel(['dialog', 'tabs'], {
      dialog: { slug: 'dialog', overview: 'Dialog', sections: [], dependencies: [], component: { variants: [{ slug: 'inner' }] } },
      tabs: { slug: 'tabs', overview: 'Tabs', sections: [], dependencies: [], component: {} }
    });
    const featureModel = createModel(['websocket'], {
      websocket: { slug: 'websocket', overview: 'Sockets', sections: [], dependencies: [], feature: { variants: [], sources: [] } }
    });
    const service = new LibraryService(
      componentModel as unknown as Model<StoredEntryDocument>,
      featureModel as unknown as Model<StoredEntryDocument>
    );
    return { service, componentModel, featureModel };
  }

  it('returns component and feature content by slug', async () => {
    const { service } = createService();

    await expect(service.findBySlug('dialog')).resolves.toMatchObject({ slug: 'dialog', component: { variants: [{ slug: 'inner' }] } });
    await expect(service.findBySlug('websocket')).resolves.toMatchObject({ slug: 'websocket', feature: { sources: [] } });
  });

  it('defaults missing component variants to an empty list', async () => {
    const { service } = createService();

    await expect(service.findBySlug('tabs')).resolves.toMatchObject({ component: { variants: [] } });
  });

  it('rejects unknown slugs without querying the content', async () => {
    const { service, componentModel, featureModel } = createService();

    await expect(service.findBySlug('missing')).rejects.toThrow('Library content "missing" was not found.');
    expect(componentModel.findOne).not.toHaveBeenCalled();
    expect(featureModel.findOne).not.toHaveBeenCalled();
  });

  it('loads known slugs and each entry once', async () => {
    const { service, componentModel } = createService();

    await service.findBySlug('dialog');
    await service.findBySlug('dialog');
    await service.findBySlug('missing').catch(() => undefined);

    expect(componentModel.distinct).toHaveBeenCalledTimes(1);
    expect(componentModel.findOne).toHaveBeenCalledTimes(1);
  });

  it('retries loading after a database error', async () => {
    const { service, componentModel } = createService();
    componentModel.distinct.mockReturnValueOnce({ exec: jest.fn().mockRejectedValue(new Error('down')) });

    await expect(service.findBySlug('dialog')).rejects.toThrow('down');
    await expect(service.findBySlug('dialog')).resolves.toMatchObject({ slug: 'dialog' });
  });
});
