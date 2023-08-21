import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  private readonly jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService({
      secret: process.env.JWT_SECRET_KEY,
    });
  }

  async hashToken(token: string): Promise<string> {
    const hashedToken = await bcrypt.hash(token, 10);
    return hashedToken;
  }

  async compareToken(token1: string, token2: string): Promise<boolean> {
    const compared = await bcrypt.compare(token1, token2);
    return compared;
  }

  async generateTokens(
    userId: number,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const accessToken = await this.createAccessToken(userId);
    const refreshToken = await this.createRefreshToken(userId);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async createAccessToken(userId: number): Promise<string> {
    return this.jwtService.signAsync(
      { id: userId },
      {
        expiresIn: 60 * 30, //30 minutes
      },
    );
  }

  private async createRefreshToken(userId: number): Promise<string> {
    return this.jwtService.signAsync(
      { id: userId },
      {
        expiresIn: 60 * 60 * 24 * 7, //1 week
      },
    );
  }
}
