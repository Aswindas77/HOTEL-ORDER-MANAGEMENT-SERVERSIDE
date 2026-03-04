import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus, OrderType, PaymentStatus } from 'src/infrastructure/enums/order-status.enum';


export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {

    @Prop({ required: true, unique: true })
    orderNumber: string;

    @Prop({ required: true })
    tokenNumber: number;

    @Prop()
    tableNumber: string;

    @Prop([
        {
            menuItemId: { type: Types.ObjectId, ref: 'Menu', required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            total: { type: Number, required: true },
        },
    ])
    items: {
        menuItemId: Types.ObjectId;
        name: string;
        price: number;
        quantity: number;
        total: number;
    }[];

    @Prop({ required: true })
    subtotal: number;

    @Prop({ default: 0 })
    tax: number;

    @Prop({ default: 0 })
    discount: number;

    @Prop({ required: true })
    grandTotal: number;

    @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Prop({ enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
