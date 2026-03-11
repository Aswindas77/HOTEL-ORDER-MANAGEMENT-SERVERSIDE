import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivationRequest, ActivationRequestSchema } from './schema/activation-request.schema';
import { ActivationRequestController } from './activation-request.controller';
import { ActivationRequestService } from './activation-request.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivationRequest.name, schema: ActivationRequestSchema }
    ])
  ],
  controllers: [ActivationRequestController],
  providers: [ActivationRequestService],
  exports: [ActivationRequestService]
})
export class ActivationRequestModule { }