import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {

  @Prop({ required: true })
  branchName: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Types.ObjectId;

  @Prop({ default: false })
  isActive: boolean;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);