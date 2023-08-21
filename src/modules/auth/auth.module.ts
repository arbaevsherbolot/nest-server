import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { TokenService } from 'src/utils/jwt';

//Declare Auth Module
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    TokenService,
  ],
})
export class AuthModule {}
