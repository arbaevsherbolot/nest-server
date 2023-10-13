import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function start() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = 888;

  //Set CORS configuration
  app.enableCors({
    origin: ['https://arbaevs.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
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
