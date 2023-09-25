import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';

//Declare Auth Module
@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
