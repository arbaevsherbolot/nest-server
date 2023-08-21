import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from '../../utils/bcrypt';
import { RegisterSchema } from './auth.schema';
import { compareToken, generateTokens, hashToken } from 'src/utils/jwt';
import { LoginhDto, RegisterDto } from './dto';
import { compare } from 'bcrypt';

//Declare Auth Service
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const { firstName, lastName, email, password } = dto;

    const existUser = await this.prisma.user.findUnique({
      where: {
        email,
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

  async login(dto: LoginhDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User is not exist');
    }

    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    const tokens = await generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return tokens;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async logout(userId: number) {
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
          refreshToken: {
            not: null,
          },
        },
        data: {
          refreshToken: null,
        },
      });
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
        firstName: true,
        lastName: true,
        photo: true,
        phone: true,
        email: true,
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
