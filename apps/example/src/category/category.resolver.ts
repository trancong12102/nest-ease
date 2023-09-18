import { Resolver } from '@nestjs/graphql';
import { CategoryBaseResolver } from './base/category-base.resolver';
import { Category } from './base/model/category.model';
import { CategoryService } from './category.service';

@Resolver(() => Category)
export class CategoryResolver extends CategoryBaseResolver {
  constructor(protected readonly service: CategoryService) {
    super(service);
  }
}
