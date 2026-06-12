import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  getMe(@Headers('authorization') auth: string) {
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();
    const payload = this.authService.validateToken(auth.slice(7));
    return this.authService.getMe(payload.sub);
  }
}
