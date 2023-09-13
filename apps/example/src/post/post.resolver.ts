import { Resolver } from '@nestjs/graphql';
import { PostBaseResolver, Post } from '../nest-ease-base';
import { PostService } from './post.service';

@Resolver(() => Post)
export class PostResolver extends PostBaseResolver {
  constructor(protected readonly service: PostService) {
    super(service);
  }
}
