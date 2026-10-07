import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { CatalogService, CatalogSummary } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300')
  search(@Query('q') query = '', @Query('type') type?: string): Promise<CatalogSummary[]> {
    return this.catalogService.search(query, type);
  }

  @Get(':slug')
  @Header('Cache-Control', 'public, max-age=300')
  findOne(@Param('slug') slug: string): Promise<CatalogSummary> {
    return this.catalogService.findBySlug(slug);
  }
}

