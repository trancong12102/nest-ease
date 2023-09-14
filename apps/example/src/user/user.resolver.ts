import { Resolver } from '@nestjs/graphql';
import { UserBaseResolver, User } from '../nest-ease/base';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver extends UserBaseResolver {
  constructor(protected readonly service: UserService) {
    super(service);
  }
}
