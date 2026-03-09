import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
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

  @Prop({ required: true })
  category: string;

  @Prop({ enum: FoodType, required: true })
  foodType: FoodType;

  @Prop({ default: true })
  isAvailable: boolean;


}

export const MenuSchema = SchemaFactory.createForClass(Menu);
