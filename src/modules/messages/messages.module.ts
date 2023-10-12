import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

//Declare Messages Module
@Module({
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
