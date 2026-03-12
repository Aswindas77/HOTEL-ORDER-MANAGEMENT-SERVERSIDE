import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivationRequest, ActivationRequestDocument } from './schema/activation-request.schema';

@Injectable()
export class ActivationRequestService {

  constructor(
    @InjectModel(ActivationRequest.name)
    private activationModel: Model<ActivationRequestDocument>,
  ) {}

  async createRequest(hotelId: string, subscriptionId: string) {

    const request = new this.activationModel({
      hotelId: new Types.ObjectId(hotelId),
      subscriptionId: new Types.ObjectId(subscriptionId),
      status: 'pending'
    });

    return request.save();
  }

  async getRequests() {
    return this.activationModel
      .find()
      .populate('hotelId')
      .populate('subscriptionId');
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