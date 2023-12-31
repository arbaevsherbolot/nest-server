import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  AuthModule,
  UsersModule,
  JwtModule,
  PrismaModule,
  MessagesModule,
  ImagesModule,
} from './modules';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './modules/auth/common/guards';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: 587,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
    AuthModule,
    PrismaModule,
    UsersModule,
    JwtModule,
    MessagesModule,
    ImagesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
