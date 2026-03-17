import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivationRequest, ActivationRequestSchema } from './schema/activation-request.schema';
import { ActivationRequestController } from './activation-request.controller';
import { ActivationRequestService } from './activation-request.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Hotel, HotelSchema } from 'src/hotel/schema/hotel.scehma';
import { Branch, BranchSchema } from 'src/branch/schema/branch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivationRequest.name, schema: ActivationRequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Hotel.name, schema: HotelSchema }, 
      { name: Branch.name, schema: BranchSchema },

    ])
  ],
  controllers: [ActivationRequestController],
  providers: [ActivationRequestService],
  exports: [ActivationRequestService]
})
export class ActivationRequestModule { }