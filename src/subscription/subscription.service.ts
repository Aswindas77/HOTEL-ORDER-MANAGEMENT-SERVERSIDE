import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schema/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { User, UserDocument } from 'src/users/schema/user.schema';

@Injectable()
export class SubscriptionService {

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {  }

  async createSubscription(createDto: CreateSubscriptionDto, hotelId: string) {

    const { planType, branchCount, branchId } = createDto;

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
      branchId: new Types.ObjectId(branchId),
      planType,
      branchCount,
      pricePerBranch,
      totalPrice,
      startDate,
      expiryDate
    });

    const savedSubscription = await subscription.save();

    await this.userModel.findOneAndUpdate(
      { hotelId: hotelId },
      {
        subscriptionId: savedSubscription._id,
        setupStep: 4
      },
      { new: true }
    );

    return savedSubscription;
  }

  async getHotelSubscription(hotelId: string) {
    return this.subscriptionModel.find({ hotelId });
  }

  async getExpiringSubscriptions() {

    const today = new Date();

    const next7days = new Date();
    next7days.setDate(today.getDate() + 7);

      return this.subscriptionModel
        .find({
          expiryDate: {
            $gte: today,
            $lte: next7days
          }
        })
        .populate('hotelId')
        .populate({
        path: 'branchId',
        model: 'Branch'
      });
    }

}