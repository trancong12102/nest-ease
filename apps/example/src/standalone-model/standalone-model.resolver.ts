import { Resolver } from '@nestjs/graphql';
import { StandaloneModelBaseResolver } from './base/standalone-model-base.resolver';
import { StandaloneModel } from './base/model/standalone.model';
import { StandaloneModelService } from './standalone-model.service';

@Resolver(() => StandaloneModel)
export class StandaloneModelResolver extends StandaloneModelBaseResolver {
  constructor(protected readonly service: StandaloneModelService) {
    super(service);
  }
}
