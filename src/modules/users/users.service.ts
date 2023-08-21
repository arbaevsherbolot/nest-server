import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        requset: true,
        last_request: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User is not exist');
    }

    const superAdmin = user.role === 'SUPERADMIN';
    const admin = user.role === 'ADMIN';

    if (!admin && !superAdmin) {
      throw new ForbiddenException(`You don't have access`);
    }

    const users = await this.prisma.user.findMany({
      select: {
        id: superAdmin ?? true,
        firstName: true,
        lastName: true,
        photo: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: superAdmin ?? true,
        refreshToken: superAdmin ?? true,
        password: superAdmin ?? true,
        requset: superAdmin ?? true,
        last_request: superAdmin ?? true,
      },
    });

    const updatedRequest = await this.prisma.user.update({
      where: {
        id: user.id,
        role: admin ? 'ADMIN' : 'SUPERADMIN',
      },
      data: {
        requset: user.requset + 1,
        last_request: new Date(),
      },
    });

    console.log(
      `
      --------------------GET USERS--------------------

      ${updatedRequest.role} - ${updatedRequest.firstName} ${
        updatedRequest.lastName
      }
      ${updatedRequest.last_request.toDateString()} - ${updatedRequest.last_request.toTimeString()}
      Requests: ${updatedRequest.requset}

      -------------------------------------------------
      `,
    );

    try {
      return users;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
