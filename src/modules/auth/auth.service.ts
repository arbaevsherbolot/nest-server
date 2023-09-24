import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from '../../utils/bcrypt';
import { RegisterSchema } from './auth.schema';
import { FileSchema } from 'src/utils/schema';
import { compareToken, generateTokens, hashToken } from 'src/utils/jwt';
import { Response } from 'express';
import {
  compareResetPasswordSecret,
  generateResetPasswordSecret,
} from 'src/utils/helpers';
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
      throw new ConflictException('User already exists');
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

    const tokens = await generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return tokens;
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
      throw new UnauthorizedException('Член семьи не найден');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Член семьи заблокирован');
    }

    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const tokens = await generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return tokens;
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
      throw new UnauthorizedException('User is not exist');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User was deactivated');
    }

    const token = await generateResetPasswordSecret(user.id);
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
      subject: 'Reset your password',
      html: `
          <h2>Hey ${user.firstName}</h2>
          <p>Please use this <a href="${forgotLink}">Link</a> to reset your password.</p>
      `,
    });

    try {
      return `Reset link has been sent to ${user.email}`;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { password, token } = dto;

    const compare = await compareResetPasswordSecret(token);
    const userId = compare.id;
    const hashedPassword = await hash(password);

    if (!userId) {
      throw new UnauthorizedException('User is not exist');
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
      return `Password of user: ${user.email} updated successfully`;
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
      throw new UnauthorizedException('User is not exist');
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
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        photo: true,
        phone: true,
        email: true,
        bio: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User is not exist');
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
      throw new UnauthorizedException('User is not exist');
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
      throw new UnauthorizedException('User is not exist');
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
      throw new ForbiddenException('Access denied');
    }

    let comparedToken: boolean;

    if (user.refreshToken) {
      comparedToken = await compareToken(token, user.refreshToken);
    }

    if (!comparedToken) {
      throw new ForbiddenException('Access denied, invalid token');
    }

    const tokens = await generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return tokens;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hashedToken = await hashToken(refreshToken);

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
