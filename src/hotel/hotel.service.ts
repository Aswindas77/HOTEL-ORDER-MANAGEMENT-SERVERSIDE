import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateHotelDto } from './dto/create-hotel.dto';
import { Hotel, HotelDocument } from './schema/hotel.scehma';

@Injectable()
export class HotelService {

  constructor(
    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,
  ) {}

  async createHotel(createHotelDto: CreateHotelDto, ownerId: string) {

    const hotel = new this.hotelModel({
      ...createHotelDto,
      ownerId: new Types.ObjectId(ownerId),
    });

    return hotel.save();
  }

  async findAllHotels() {
    return this.hotelModel.find();
  }

  async findHotelById(id: string) {

    const hotel = await this.hotelModel.findById(id);

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }
}