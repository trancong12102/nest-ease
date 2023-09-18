import { Injectable } from '@nestjs/common';
import { CategoryBaseService } from './base/category-base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService extends CategoryBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
