import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { Hotel, HotelSchema } from '../hotel/schema/hotel.scehma';
import { Branch, BranchSchema } from '../branch/schema/branch.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schema/subscription.schema';
import { ActivationRequest, ActivationRequestSchema } from '../activation-request/schema/activation-request.schema';
import { User, UserSchema } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: ActivationRequest.name, schema: ActivationRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}