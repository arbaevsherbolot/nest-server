import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { GetCurrentUserId, Public } from '../auth/common/decorators';
import { NewMessageDto } from './dto/messages.dto';

//Declare Messages Controller
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Public()
  @Post()
  async newMessage(@Body() dto: NewMessageDto) {
    return await this.messagesService.newMessage(dto);
  }

  @Get()
  async getMessages(@GetCurrentUserId() userId: number) {
    return await this.messagesService.getMessages(userId);
  }
}
