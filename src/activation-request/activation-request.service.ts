import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivationRequest, ActivationRequestDocument } from './schema/activation-request.schema';

@Injectable()
export class ActivationRequestService {

  constructor(
    @InjectModel(ActivationRequest.name)
    private activationModel: Model<ActivationRequestDocument>,
  ) {}

  
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

    const { hotelId, branchId } = this.getContext(user);

    const skip = (page - 1) * limit;

    const filter: any = {
      hotelId,
      branchId
    };

    if (status) {
      filter.status = status;
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

    const { hotelId, branchId } = this.getContext(user);

    const request = await this.activationModel.findOne({
      _id: new Types.ObjectId(id),
      hotelId,
      branchId
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.status = 'approved';

    return request.save();
  }


  async rejectRequest(id: string, user: any) {

    const { hotelId, branchId } = this.getContext(user);

    const request = await this.activationModel.findOne({
      _id: new Types.ObjectId(id),
      hotelId,
      branchId
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.status = 'rejected';

    return request.save();
  }
}