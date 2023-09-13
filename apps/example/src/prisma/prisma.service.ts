import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../prisma-client';

@Injectable()
export class PrismaService implements OnModuleDestroy, OnModuleInit {
  public readonly client: ReturnType<typeof this.createExtendedPrisma>;

  constructor() {
    this.client = this.createExtendedPrisma();
  }

  private createExtendedPrisma() {
    return new PrismaClient().$extends({});
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  async onModuleInit() {
    await this.client.$connect();
  }
}
