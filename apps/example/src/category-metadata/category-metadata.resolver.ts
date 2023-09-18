import { Resolver } from '@nestjs/graphql';
import { CategoryMetadataBaseResolver } from './base/category-metadata-base.resolver';
import { CategoryMetadata } from './base/model/category-metadata.model';
import { CategoryMetadataService } from './category-metadata.service';

@Resolver(() => CategoryMetadata)
export class CategoryMetadataResolver extends CategoryMetadataBaseResolver {
  constructor(protected readonly service: CategoryMetadataService) {
    super(service);
  }
}
