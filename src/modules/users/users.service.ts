import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserSchema } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(userId: number): Promise<UserSchema[]> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        requests: true,
        lastRequest: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User is not exist');
    }

    const superAdmin = user.role === 'SUPERADMIN';
    const admin = user.role === 'ADMIN';

    const users: UserSchema[] = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photo: true,
        phone: true,
        bio: true,
        email: true,
        createdAt: (superAdmin || admin) && true,
        updatedAt: (superAdmin || admin) && true,
        role: true,
        isVerified: true,
        isActive: true,
        refreshToken: superAdmin ?? true,
        password: superAdmin ?? true,
        requests: superAdmin ?? true,
        lastRequest: superAdmin ?? true,
      },
    });

    if (admin || superAdmin) {
      await this.prisma.user.update({
        where: {
          id: user.id,
          role: admin ? 'ADMIN' : 'SUPERADMIN',
        },
        data: {
          requests: user?.requests ? user.requests + 1 : undefined,
          lastRequest: new Date(),
        },
      });
    }

    try {
      return users;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getUser(id: number): Promise<UserSchema> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        role: true,
        requests: true,
        lastRequest: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User is not exist');
    }

    const superAdmin = user.role === 'SUPERADMIN';
    const admin = user.role === 'ADMIN';

    const dbUser: UserSchema = await this.prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photo: true,
        phone: true,
        bio: true,
        email: true,
        createdAt: (superAdmin || admin) && true,
        updatedAt: (superAdmin || admin) && true,
        role: true,
        isVerified: true,
        isActive: true,
        refreshToken: superAdmin ?? true,
        password: superAdmin ?? true,
        requests: superAdmin ?? true,
        lastRequest: superAdmin ?? true,
      },
    });

    if (admin || superAdmin) {
      await this.prisma.user.update({
        where: {
          id: user.id,
          role: admin ? 'ADMIN' : 'SUPERADMIN',
        },
        data: {
          requests: user?.requests ? user.requests + 1 : undefined,
          lastRequest: new Date(),
        },
      });
    }

    return dbUser;
  }
}
