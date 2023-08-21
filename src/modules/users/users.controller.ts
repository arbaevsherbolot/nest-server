import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { GetCurrentUserId } from 'src/modules/auth/common/decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getUsers(@GetCurrentUserId() userId: number) {
    return this.usersService.getUsers(userId);
  }
}
