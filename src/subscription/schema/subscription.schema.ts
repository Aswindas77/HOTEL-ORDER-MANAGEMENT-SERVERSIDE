import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Types.ObjectId;

  @Prop({ required: true, enum: ['classic', 'standard', 'premium'] })
  planType: string;

  @Prop({ required: true })
  branchCount: number;

  @Prop({ required: true })
  pricePerBranch: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ default: 'pending' })
  paymentStatus: string;

  @Prop({ default: 'inactive' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branchId: Types.ObjectId;
}

export const SubscriptionSchema =
  SchemaFactory.createForClass(Subscription);