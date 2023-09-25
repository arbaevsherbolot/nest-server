import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

//Declare Users Module
@Module({
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
