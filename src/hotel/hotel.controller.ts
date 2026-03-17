import { Controller, Post, Body, Get, Param, Req, UseGuards, Query } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('hotels')
export class HotelController {

  constructor(private readonly hotelService: HotelService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createHotel(
    @Body() body: CreateHotelDto,
    @Req() req
  ) {

    const userId = req.user.userId;

    return this.hotelService.createHotel(body, userId);
  }

  @Get()
  getHotels(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    return this.hotelService.findAllHotels(page, limit, search, status);
  }

  @Get(':id')
  getHotel(@Param('id') id: string) {
    return this.hotelService.findHotelById(id);
  }
}