import { Injectable } from '@nestjs/common';
import { StandaloneModelBaseService } from './base/standalone-model-base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StandaloneModelService extends StandaloneModelBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
