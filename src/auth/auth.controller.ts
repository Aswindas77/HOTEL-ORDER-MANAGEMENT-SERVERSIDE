import { Controller, Post, Body, Patch, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @UseGuards(AuthGuard('jwt'))
@Patch('setup-step')
updateSetupStep(@Body() body, @Req() req) {
  return this.authService.updateSetupStep(
    req.user.userId,
    body.setupStep,
    body.hotelId
  );
}

@UseGuards(AuthGuard('jwt'))
@Get('me')
getMe(@Req() req) {
  return this.authService.getProfile(req.user.userId);
}
}
