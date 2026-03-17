import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivationRequest, ActivationRequestDocument } from './schema/activation-request.schema';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { Hotel, HotelDocument } from 'src/hotel/schema/hotel.scehma';
import { Branch, BranchDocument } from 'src/branch/schema/branch.schema';

@Injectable()
export class ActivationRequestService {

  constructor(
    @InjectModel(ActivationRequest.name)
    private activationModel: Model<ActivationRequestDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,
    @InjectModel(Branch.name)
    private branchModel: Model<BranchDocument>,
  ) { }

  async createRequest(hotelId: string, subscriptionId: string, branchId: string) {

    const request = new this.activationModel({
      hotelId: new Types.ObjectId(hotelId),
      subscriptionId: new Types.ObjectId(subscriptionId),
      branchId: new Types.ObjectId(branchId),
      status: 'pending'
    });

    const savedRequest = await request.save();

    await this.userModel.findOneAndUpdate(
      { hotelId: new Types.ObjectId(hotelId), setupStep: { $lt: 5 } },
      { setupStep: 5 },
      { new: true }
    );

    return savedRequest;
  }

  async getRequests(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) {

  const skip = (page - 1) * limit;
  const filter: any = {};

  // ✅ STATUS FILTER
  if (status) {
    filter.status = status;
  }

  // 🔍 SEARCH (hotel + branch)
  if (search) {

    const hotels = await this.hotelModel.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id');

    const branches = await this.branchModel.find({
      branchName: { $regex: search, $options: 'i' }
    }).select('_id');

    const hotelIds = hotels.map(h => h._id);
    const branchIds = branches.map(b => b._id);

    filter.$or = [
      { hotelId: { $in: hotelIds } },
      { branchId: { $in: branchIds } }
    ];
  }

  const results = await this.activationModel
    .find(filter)
    .populate('hotelId')
    .populate('subscriptionId')
    .populate('branchId')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await this.activationModel.countDocuments(filter);

  return {
    data: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

  async approveRequest(id: string) {

    const request = await this.activationModel.findById(id);

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.status = 'approved';

    return request.save();
  }

  async rejectRequest(id: string) {

    const request = await this.activationModel.findById(id);

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.status = 'rejected';

    return request.save();
  }

}