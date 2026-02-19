import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/orders.schema';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { Menu, MenuSchema } from 'src/menu/schema/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrdersModule {}
