import { Test } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { LibraryController } from '../library/library.controller';
import { LibraryService } from '../library/library.service';

describe('Catalog and library controllers', () => {
  const catalogService = { search: jest.fn().mockResolvedValue([]), findBySlug: jest.fn().mockResolvedValue({ slug: 'dialog' }) };
  const libraryService = { findBySlug: jest.fn().mockResolvedValue({ slug: 'dialog' }) };

  async function createControllers() {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatalogController, LibraryController],
      providers: [
        { provide: CatalogService, useValue: catalogService },
        { provide: LibraryService, useValue: libraryService }
      ]
    }).compile();
    return { catalog: moduleRef.get(CatalogController), library: moduleRef.get(LibraryController) };
  }

  it('passes search parameters to the catalog service', async () => {
    const { catalog } = await createControllers();

    await catalog.search('dialog', 'component');
    await catalog.search();

    expect(catalogService.search).toHaveBeenCalledWith('dialog', 'component');
    expect(catalogService.search).toHaveBeenCalledWith('', undefined);
  });

  it('looks entries up by slug', async () => {
    const { catalog, library } = await createControllers();

    await expect(catalog.findOne('dialog')).resolves.toEqual({ slug: 'dialog' });
    await expect(library.findOne('dialog')).resolves.toEqual({ slug: 'dialog' });
  });

  it('lets clients cache catalog and library responses for five minutes', () => {
    const header = (target: object, method: string) => Reflect.getMetadata('__headers__', (target as Record<string, object>)[method]);

    for (const [target, method] of [[CatalogController.prototype, 'search'], [CatalogController.prototype, 'findOne'], [LibraryController.prototype, 'findOne']] as const) {
      expect(header(target, method)).toEqual([{ name: 'Cache-Control', value: 'public, max-age=300' }]);
    }
  });
});
