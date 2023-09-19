import { Module } from '@nestjs/common';
import { StandaloneModelService } from './standalone-model.service';
import { StandaloneModelResolver } from './standalone-model.resolver';

@Module({
  providers: [StandaloneModelService, StandaloneModelResolver],
  exports: [StandaloneModelService],
})
export class StandaloneModelModule {}
