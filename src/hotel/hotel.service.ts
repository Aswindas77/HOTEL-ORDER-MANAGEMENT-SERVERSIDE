import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateHotelDto } from './dto/create-hotel.dto';
import { Hotel, HotelDocument } from './schema/hotel.scehma';
import { User, UserDocument } from 'src/users/schema/user.schema';

@Injectable()
export class HotelService {

  constructor(
    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) { }

  async createHotel(createHotelDto: CreateHotelDto, ownerId: string) {

    const hotel = new this.hotelModel({
      ...createHotelDto,
      ownerId: new Types.ObjectId(ownerId),
    });

    const savedHotel = await hotel.save();

    await this.userModel.findByIdAndUpdate(ownerId, {
      hotelId: savedHotel._id,
      setupStep: 2
    });

    return savedHotel
  }

  async findAllHotels(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {

    const skip = (page - 1) * limit;

    const filter: any = {};

    // 🔎 Search filter
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // ✅ Status filter
    if (status !== undefined) {
      filter.isActive = status === 'true';
    }

    const hotels = await this.hotelModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.hotelModel.countDocuments(filter);

    return {
      data: hotels,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findHotelById(id: string) {

    const hotel = await this.hotelModel
      .findById(id)
      .populate('ownerId', 'name email phone address');

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }
}