import { Resolver } from '@nestjs/graphql';
import { StandaloneBaseResolver } from './base/standalone-base.resolver';
import { Standalone } from './base/model/standalone.model';
import { StandaloneService } from './standalone.service';

@Resolver(() => Standalone)
export class StandaloneResolver extends StandaloneBaseResolver {
  constructor(protected readonly service: StandaloneService) {
    super(service);
  }
}
