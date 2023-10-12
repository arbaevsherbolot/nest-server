import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { GetCurrentUserId } from '../auth/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageDto } from './dto';

//Declare Images Controller
@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Put()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageDto,
  ) {
    return await this.imagesService.uploadImage(userId, file, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getImages(@GetCurrentUserId() userId: number) {
    return await this.imagesService.getImages(userId);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getImage(
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.imagesService.getImage(userId, id);
  }
}
