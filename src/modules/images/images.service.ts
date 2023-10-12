import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getUrl, upload } from '../../utils/supabase';
import { ImageDto } from './dto';

//Declare Images Service
@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadImage(userId: number, file: Express.Multer.File, dto: ImageDto) {
    const { title } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!file) {
      throw new NotFoundException('Файл не найден');
    }

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const path = await upload(user.id, file, '/photos');
    const url = getUrl('/photos', path);

    const image = await this.prisma.image.create({
      data: {
        authorId: user.id,
        url,
        title: title ? title : '',
      },
    });

    try {
      return image;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getImages(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const images = await this.prisma.image.findMany({
      where: {
        authorId: user.id,
      },
    });

    try {
      return images;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getImage(userId: number, id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const image = await this.prisma.image.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    try {
      return image;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
