import { Injectable } from '@nestjs/common';
import { PostBaseService } from '../nest-ease/base';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService extends PostBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
