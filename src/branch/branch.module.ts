import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './schema/branch.schema';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Hotel, HotelSchema } from 'src/hotel/schema/hotel.scehma';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Branch.name, schema: BranchSchema },
      { name: Hotel.name, schema: HotelSchema },
      { name: User.name, schema: UserSchema },
    ])
  ],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService]
})
export class BranchModule {}