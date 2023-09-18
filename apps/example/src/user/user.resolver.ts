import { Resolver } from '@nestjs/graphql';
import { UserBaseResolver } from './base/user-base.resolver';
import { User } from './base/model/user.model';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver extends UserBaseResolver {
  constructor(protected readonly service: UserService) {
    super(service);
  }
}
