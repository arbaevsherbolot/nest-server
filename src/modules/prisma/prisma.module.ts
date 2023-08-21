import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

//Declare Prisma Module
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
