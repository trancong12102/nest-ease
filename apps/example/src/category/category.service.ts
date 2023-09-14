import { Injectable } from '@nestjs/common';
import { CategoryBaseService } from '../nest-ease/base';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService extends CategoryBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
