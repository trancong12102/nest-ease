import { Injectable } from '@nestjs/common';
import { StandaloneBaseService } from './base/standalone-base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StandaloneService extends StandaloneBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
