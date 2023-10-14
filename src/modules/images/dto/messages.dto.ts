import { IsOptional, IsString } from 'class-validator';

export class ImageDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  width: string;

  @IsString()
  height: string;
}
