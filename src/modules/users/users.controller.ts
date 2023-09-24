import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
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

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }
}
