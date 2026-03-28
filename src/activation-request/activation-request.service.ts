import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    @InjectModel(Branch.name)
private branchModel: Model<BranchDocument>,

  ) { }


  private getContext(user: any) {
    return {
      hotelId: new Types.ObjectId(user.hotelId),
      branchId: new Types.ObjectId(user.branchId),
    };
  }


  async createRequest(user: any, subscriptionId: string) {

    const { hotelId, branchId } = this.getContext(user);


    const existing = await this.activationModel.findOne({
      hotelId,
      branchId,
      status: 'pending'
    });

    if (existing) {
      throw new BadRequestException('Request already pending');
    }

    return this.activationModel.create({
      hotelId,
      branchId,
      subscriptionId: new Types.ObjectId(subscriptionId),
      status: 'pending'
    });
  }


  async getRequests(
    user: any,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    const filter: any = {};


    if (status) {
      filter.status = status;
    }


    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } }
      ];
    }

    const [results, total] = await Promise.all([
      this.activationModel
        .find(filter)
        .populate('hotelId')
        .populate('subscriptionId')
        .populate('branchId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      this.activationModel.countDocuments(filter),
    ]);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async approveRequest(id: string, user: any) {

    const request = await this.activationModel.findById(id);

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status === 'approved') {
      throw new BadRequestException('Already approved');
    }

    // ✅ Step 1: Approve request
    request.status = 'approved';
    await request.save();

    // ✅ Step 2: Get hotel
    const hotel = await this.hotelModel.findById(request.hotelId);

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // ✅ Step 3: Update owner setupStep
    await this.userModel.findByIdAndUpdate(
      hotel.ownerId,
      { setupStep: 6 },
      { new: true }
    );

  // ⭐ Step 3: change hotel status to active
  hotel.isActive = true;
  await hotel.save();

    // Step 4: activate branch
  await this.branchModel.findByIdAndUpdate(
    request.branchId,
    { isActive: true },
    { new: true }
  );

  // Step 5: activate users of this hotel (or branch)
  await this.userModel.updateMany(
    { branchId: request.branchId },
    { isActive: true }
  );

    return request;
  }


  async rejectRequest(id: string, user: any) {

    const request = await this.activationModel.findById(
      new Types.ObjectId(id)
    );

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status === 'rejected') {
      throw new BadRequestException('Already rejected');
    }

    request.status = 'rejected';

    return request.save();
  }
}