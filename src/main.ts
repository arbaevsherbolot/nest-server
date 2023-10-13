import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function start() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = 888;

  //Set CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'https://arbaevs.vercel.app'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true,
  });

  //Set the global prefix for our server
  app.setGlobalPrefix('api');

  //Set the global validation pipes for our server
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, () =>
    console.log(`📢 Server starting on: http://localhost:${port}/ ⚡️`),
  );
}
start();
