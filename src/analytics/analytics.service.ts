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

    const totalHotels = await this.hotelModel.countDocuments();
    const totalBranches = await this.branchModel.countDocuments();
    const totalUsers = await this.userModel.countDocuments();

    const pendingRequests = await this.activationModel.countDocuments({
      status: 'pending'
    });

    const approvedRequests = await this.activationModel.countDocuments({
      status: 'approved'
    });

    const rejectedRequests = await this.activationModel.countDocuments({
      status: 'rejected'
    });

    const premiumPlans = await this.subscriptionModel.countDocuments({
      planType: 'premium'
    });

    const standardPlans = await this.subscriptionModel.countDocuments({
      planType: 'standard'
    });

    const classicPlans = await this.subscriptionModel.countDocuments({
      planType: 'classic'
    });

    return {
      hotels: totalHotels,
      branches: totalBranches,
      users: totalUsers,

      activationRequests: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests
      },

      subscriptions: {
        premium: premiumPlans,
        standard: standardPlans,
        classic: classicPlans
      }
    };
  }

}