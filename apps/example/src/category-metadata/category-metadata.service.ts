import { Injectable } from '@nestjs/common';
import { CategoryMetadataBaseService } from '../nest-ease-base';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryMetadataService extends CategoryMetadataBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
