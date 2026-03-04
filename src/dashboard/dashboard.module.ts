import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Menu, MenuSchema } from '../menu/schema/menu.schema';
import { Order, OrderSchema } from '../orders/schema/orders.schema';
import { Table, TableSchema } from '../tables/schema/table.schema';
import { User, UserSchema } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Table.name, schema: TableSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}