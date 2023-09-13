import { Module } from '@nestjs/common';
import { StandaloneService } from './standalone.service';
import { StandaloneResolver } from './standalone.resolver';

@Module({
  providers: [StandaloneService, StandaloneResolver],
  exports: [StandaloneService],
})
export class StandaloneModule {}
