import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { HotelService } from './hotel.service';

@Controller('hotels')
export class HotelController {

  constructor(private hotelService: HotelService) {}

  @Post()
  createHotel(@Body() body: any) {
    return this.hotelService.createHotel(body);
  }

  @Get()
  getHotels() {
    return this.hotelService.findAllHotels();
  }

  @Get(':id')
  getHotel(@Param('id') id: string) {
    return this.hotelService.findHotelById(id);
  }
}