import { Controller, Get, Param } from '@nestjs/common';
import { LibraryContentView, LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string): Promise<LibraryContentView> {
    return this.libraryService.findBySlug(slug);
  }
}

