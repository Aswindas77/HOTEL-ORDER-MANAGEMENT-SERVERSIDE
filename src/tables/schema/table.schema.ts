import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';

export type TableDocument = Table & Document;

@Schema({ timestamps: true })
export class Table {

  @Prop({ required: true, unique: true, trim: true })
  tableNumber: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true, unique: true })
  accessToken: string;

  @Prop({ enum: TableStatus, default: TableStatus.AVAILABLE })
  status: TableStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  qrCode: string;

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;
}

export const TableSchema = SchemaFactory.createForClass(Table);
