import { Controller, Post, Body, Get } from '@nestjs/common';
import { HotelService } from '../hotel/hotel.service';

@Controller('admin')
export class AdminController {

  constructor(private hotelService: HotelService) {}

  @Post('create-hotel')
  createHotel(@Body() body: any) {
    return this.hotelService.createHotel(body);
  }

  @Get('hotels')
  getHotels() {
    return this.hotelService.findAllHotels();
  }
}