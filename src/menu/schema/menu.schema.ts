import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FoodType, MenuCategory } from 'src/infrastructure/enums/menu.enum';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId |any;

  @Prop({ enum: FoodType, required: true })
  foodType: FoodType;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

}

export const MenuSchema = SchemaFactory.createForClass(Menu);
