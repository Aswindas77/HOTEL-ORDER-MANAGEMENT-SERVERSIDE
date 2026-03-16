import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivationRequest, ActivationRequestDocument } from './schema/activation-request.schema';
import { User, UserDocument } from 'src/users/schema/user.schema';

@Injectable()
export class ActivationRequestService {

  constructor(
    @InjectModel(ActivationRequest.name)
    private activationModel: Model<ActivationRequestDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
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

  async getRequests() {
    return this.activationModel
      .find()
      .populate('hotelId')
      .populate('subscriptionId')
      .populate('branchId');
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