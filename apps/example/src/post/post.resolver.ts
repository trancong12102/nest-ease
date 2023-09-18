import { Resolver } from '@nestjs/graphql';
import { PostBaseResolver } from './base/post-base.resolver';
import { Post } from './base/model/post.model';
import { PostService } from './post.service';

@Resolver(() => Post)
export class PostResolver extends PostBaseResolver {
  constructor(protected readonly service: PostService) {
    super(service);
  }
}
