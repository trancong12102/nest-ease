import { Resolver } from '@nestjs/graphql';
import { CategoryBaseResolver, Category } from '../nest-ease/base';
import { CategoryService } from './category.service';

@Resolver(() => Category)
export class CategoryResolver extends CategoryBaseResolver {
  constructor(protected readonly service: CategoryService) {
    super(service);
  }
}
