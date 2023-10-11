import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class NewMessageDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  message: string;
}
