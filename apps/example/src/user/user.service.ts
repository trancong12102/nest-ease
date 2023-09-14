import { Injectable } from '@nestjs/common';
import { UserBaseService } from '../nest-ease/base';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService extends UserBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
