import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule , UsersModule} from './modules/index';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './modules/auth/common/guards';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
