import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schema/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async createSubscription(createDto: CreateSubscriptionDto, hotelId: string) {

    const { planType, branchCount } = createDto;

    let pricePerBranch = 0;

    if (planType === 'classic') pricePerBranch = 500;
    if (planType === 'standard') pricePerBranch = 800;
    if (planType === 'premium') pricePerBranch = 1200;

    const totalPrice = pricePerBranch * branchCount;

    const startDate = new Date();

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const subscription = new this.subscriptionModel({
      hotelId: new Types.ObjectId(hotelId),
      planType,
      branchCount,
      pricePerBranch,
      totalPrice,
      startDate,
      expiryDate
    });

    return subscription.save();
  }

  async getHotelSubscription(hotelId: string) {
    return this.subscriptionModel.find({ hotelId });
  }
}