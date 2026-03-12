import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivationRequestDocument = ActivationRequest & Document;

@Schema({ timestamps: true })
export class ActivationRequest {

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
  subscriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

  @Prop({
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  })
  status: string;

}

export const ActivationRequestSchema =
  SchemaFactory.createForClass(ActivationRequest);