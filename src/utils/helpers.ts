import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const jwt = new JwtService();

export const generateResetPasswordSecret = async (
  userId: number,
): Promise<string> => {
  const token = await jwt.signAsync(
    { id: userId },
    {
      secret: process.env.JWT_ACCESS_TOKEN_RESET_SECRET,
      expiresIn: 60 * 2, //2 minutes
    },
  );

  return token;
};

export const compareResetPasswordSecret = async (token: string) => {
  try {
    const decoded = await jwt.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_TOKEN_RESET_SECRET,
    });

    return decoded;
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token has expired');
    } else {
      throw new UnauthorizedException('Invalid token');
    }
  }
};
