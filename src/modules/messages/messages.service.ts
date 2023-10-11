import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NewMessageDto } from './dto/messages.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

//Declare Messages Service
@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async newMessage(dto: NewMessageDto) {
    const { name, email, message } = dto;

    try {
      const newMessage = await this.prisma.messsage.create({
        data: {
          name,
          email,
          message,
        },
      });

      await this.mailerService.sendMail({
        to: 'sherbolot@wedevx.co',
        from: email,
        subject: 'New Message',
        html: `
            <h2>Name: ${name}, Email: ${email}</h2>
            <p>${message}</p>
        `,
      });

      return newMessage;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getMessages(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь заблокирован');
    }

    if (user.firstName !== 'Шерболот' && user.lastName !== 'Арбаев') {
      throw new ForbiddenException(
        'Пользователь не имеет возможности получать сообщения',
      );
    }

    try {
      const messages = await this.prisma.messsage.findMany();

      return messages;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
