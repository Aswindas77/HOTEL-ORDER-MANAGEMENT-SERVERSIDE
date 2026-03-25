import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Hotel, HotelDocument } from '../hotel/schema/hotel.scehma';
import { Branch, BranchDocument } from '../branch/schema/branch.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schema/subscription.schema';
import { ActivationRequest, ActivationRequestDocument } from '../activation-request/schema/activation-request.schema';
import { User, UserDocument } from '../users/schema/user.schema';

@Injectable()
export class AnalyticsService {

  constructor(
    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,

    @InjectModel(Branch.name)
    private branchModel: Model<BranchDocument>,

    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,

    @InjectModel(ActivationRequest.name)
    private activationModel: Model<ActivationRequestDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getAnalytics() {


    const [
      totalHotels,
      totalBranches,
      totalUsers,

      pendingRequests,
      approvedRequests,
      rejectedRequests,

      premiumPlans,
      standardPlans,
      classicPlans
    ] = await Promise.all([

      this.hotelModel.countDocuments(),
      this.branchModel.countDocuments(),
      this.userModel.countDocuments(),

      this.activationModel.countDocuments({ status: 'pending' }),
      this.activationModel.countDocuments({ status: 'approved' }),
      this.activationModel.countDocuments({ status: 'rejected' }),

      this.subscriptionModel.countDocuments({ planType: 'premium' }),
      this.subscriptionModel.countDocuments({ planType: 'standard' }),
      this.subscriptionModel.countDocuments({ planType: 'classic' }),

    ]);

  
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRequests = await this.activationModel.countDocuments({
      createdAt: { $gte: today }
    });

    return {
      hotels: totalHotels,
      branches: totalBranches,
      users: totalUsers,

      activationRequests: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        today: todayRequests
      },

      subscriptions: {
        premium: premiumPlans,
        standard: standardPlans,
        classic: classicPlans
      }
    };
  }
}