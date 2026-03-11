import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';

@Controller('hotels')
export class HotelController {

  constructor(private readonly hotelService: HotelService) {}

  @Post()
  createHotel(
    @Body() body: CreateHotelDto,
    @Req() req
  ) {

    const userId = req.user.id;

    return this.hotelService.createHotel(body, userId);
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