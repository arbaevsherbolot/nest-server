import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NewMessageDto } from './dto';
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
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007BFF;">New Message Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
              <strong>Message:</strong>
              <br />
              ${message}
            </p>
            <p style="color: #007BFF;">© Sherbolot Arbaev - Contacts</p>
          </div>
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
