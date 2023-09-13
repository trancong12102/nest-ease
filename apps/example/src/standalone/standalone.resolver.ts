import { Resolver } from '@nestjs/graphql';
import { StandaloneBaseResolver, Standalone } from '../nest-ease-base';
import { StandaloneService } from './standalone.service';

@Resolver(() => Standalone)
export class StandaloneResolver extends StandaloneBaseResolver {
  constructor(protected readonly service: StandaloneService) {
    super(service);
  }
}
