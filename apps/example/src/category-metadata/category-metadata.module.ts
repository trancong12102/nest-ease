import { Module } from '@nestjs/common';
import { CategoryMetadataService } from './category-metadata.service';
import { CategoryMetadataResolver } from './category-metadata.resolver';

@Module({
  providers: [CategoryMetadataService, CategoryMetadataResolver],
  exports: [CategoryMetadataService],
})
export class CategoryMetadataModule {}
