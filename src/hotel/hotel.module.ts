import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from './schema/hotel.scehma';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { User, UserSchema } from 'src/users/schema/user.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: User.name, schema: UserSchema },
    ])
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService]
})
export class HotelModule {}