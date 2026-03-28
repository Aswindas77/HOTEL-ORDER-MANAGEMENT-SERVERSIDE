import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema({ timestamps: true })
export class Hotel {

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ default: false })
  isActive: boolean;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);