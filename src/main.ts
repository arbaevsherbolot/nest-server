import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function start() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = 888;

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://arbaevs.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  //Set CORS configuration
  app.enableCors();

  //Set the global prefix for our server
  app.setGlobalPrefix('api');

  //Set the global validation pipes for our server
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, () =>
    console.log(`📢 Server starting on: http://localhost:${port}/ ⚡️`),
  );
}
start();
