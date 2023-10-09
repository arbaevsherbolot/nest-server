import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { RefreshTokenGuard } from './common/guards';
import { GetCurrentUser, GetCurrentUserId, Public } from './common/decorators';
import {
  EditProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

//Declare Auth Controller
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetCurrentUserId() userId: number) {
    return this.authService.getProfile(userId);
  }

  @Put('profile/edit')
  @HttpCode(HttpStatus.OK)
  async editProfile(
    @Body() dto: EditProfileDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.authService.editProfile(userId, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @Put('upload/photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.uploadPhoto(userId, file);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
