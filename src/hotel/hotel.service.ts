import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel, HotelDocument } from './schema/hotel.scehma';

@Injectable()
export class HotelService {

  constructor(
    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,
  ) {}

  async createHotel(data: any) {
    const hotel = new this.hotelModel(data);
    return hotel.save();
  }

  async findAllHotels() {
    return this.hotelModel.find();
  }

  async findHotelById(id: string) {
    return this.hotelModel.findById(id);
  }
}