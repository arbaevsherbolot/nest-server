import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';

//Declare Images Module
@Module({
  providers: [ImagesService],
  controllers: [ImagesController]
})
export class ImagesModule {}
