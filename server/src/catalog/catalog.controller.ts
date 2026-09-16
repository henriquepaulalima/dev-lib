import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService, CatalogSummary } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  search(@Query('q') query = '', @Query('type') type?: string): Promise<CatalogSummary[]> {
    return this.catalogService.search(query, type);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string): Promise<CatalogSummary> {
    return this.catalogService.findBySlug(slug);
  }
}

