import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';

export type TableDocument = Table & Document;

@Schema({ timestamps: true })
export class Table {

  @Prop({ required: true, unique: true, trim: true })
  tableNumber: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ enum: TableStatus, default: TableStatus.AVAILABLE })
  status: TableStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  qrCode: string;
}

export const TableSchema = SchemaFactory.createForClass(Table);
