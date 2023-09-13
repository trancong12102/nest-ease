import { Resolver } from '@nestjs/graphql';
import {
  CategoryMetadataBaseResolver,
  CategoryMetadata,
} from '../nest-ease-base';
import { CategoryMetadataService } from './category-metadata.service';

@Resolver(() => CategoryMetadata)
export class CategoryMetadataResolver extends CategoryMetadataBaseResolver {
  constructor(protected readonly service: CategoryMetadataService) {
    super(service);
  }
}
