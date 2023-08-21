import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const jwt = new JwtService();

export const hashToken = (token: string) => bcrypt.hash(token, 10);
export const compareToken = (token1: string, token2: string) =>
  bcrypt.compare(token1, token2);

const createAccessToken = async (userId: number) => {
  const token = await jwt.signAsync(
    { id: userId },
    {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: 60 * 30, //30 minutes
    },
  );

  return token;
};

const createRefreshToken = async (userId: number) => {
  const token = await jwt.signAsync(
    { id: userId },
    {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: 60 * 60 * 24 * 7, //1 week
    },
  );

  return token;
};

export const generateTokens = async (userId: number) => {
  const accessToken = await createAccessToken(userId);
  const refreshToken = await createRefreshToken(userId);

  const tokens = {
    access_token: accessToken,
    refresh_token: refreshToken,
  };

  return tokens;
};
