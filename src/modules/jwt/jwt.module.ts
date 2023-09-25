import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';

//Declare JWT Module
@Global()
@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
