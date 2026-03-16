import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { HotelService } from '../hotel/hotel.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';

@Controller('admin')
export class AdminController {

  constructor(
    private hotelService: HotelService,
    private authService:AuthService
  ) { }


  @Get('hotels')
  getHotels() {
    return this.hotelService.findAllHotels();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req) {
    return this.authService.getProfile(req.user.userId);
  }
}