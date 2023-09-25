import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../jwt/jwt.service';
import { hash } from '../../utils/bcrypt';
import { RegisterSchema } from './auth.schema';
import { FileSchema } from '../../utils/schema';
import { LoginDto, RegisterDto } from './dto';
import { compare } from 'bcrypt';
import {
  EditProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

//Declare Auth Service
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const { firstName, lastName, email, password } = dto;

    const existUser = await this.prisma.user.findUnique({
      where: {
        firstName,
      },
    });

    if (existUser) {
      throw new ConflictException('Пользователь уже существует');
    }

    const hashedPassword = await hash(password);

    const data: RegisterSchema = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    const user = await this.prisma.user.create({
      data,
    });

    const tokens = await this.jwt.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return {
        user,
        tokens,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async login(dto: LoginDto) {
    const { firstName, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        firstName,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь заблокирован');
    }

    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const tokens = await this.jwt.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return {
        user,
        tokens,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { firstName } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        firstName,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь заблокирован');
    }

    const token = await this.jwt.generateResetPasswordSecret(user.id);
    const forgotLink = `${process.env.CLIENT_APP_URL}/password/reset/?token=${token}`;

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetPasswordSecret: token,
      },
    });

    await this.mailerService.sendMail({
      to: user.email,
      from: process.env.MAILER_USER,
      subject: 'Сброс пароля',
      html: `
          <h2>Привет ${user.firstName}</h2>
          <p>Для восстановления пароля воспользуйтесь этой <a href="${forgotLink}">ссылкой</a>.</p>
      `,
    });

    try {
      return `Ссылка на сброс пароля отправлена на ${user.email}`;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { password, token } = dto;

    const compare = await this.jwt.compareResetPasswordSecret(token);
    const userId = compare.id;
    const hashedPassword = await hash(password);

    if (!userId) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    try {
      return `Пароль пользователя: ${user.email} успешно обновлен`;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async logout(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    try {
      if (user.refreshToken !== null) {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            refreshToken: null,
          },
        });
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    try {
      return user;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async editProfile(userId: number, dto: EditProfileDto) {
    const { firstName, lastName, bio } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        bio,
      },
    });

    try {
      return updatedUser;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async uploadPhoto(userId: number, file: FileSchema) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        photo: file.filename,
      },
    });

    try {
      return updatedUser.photo;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async refreshToken(userId: number, token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    let comparedToken: boolean;

    if (user.refreshToken) {
      comparedToken = await this.jwt.compareToken(token, user.refreshToken);
    }

    if (!comparedToken) {
      throw new ForbiddenException('Доступ запрещен, недействительный токен');
    }

    const tokens = await this.jwt.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return tokens;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hashedToken = await this.jwt.hashToken(refreshToken);

    try {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: hashedToken,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
