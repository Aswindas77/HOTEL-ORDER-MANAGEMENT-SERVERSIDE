import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Menu, MenuDocument } from 'src/menu/schema/menu.schema';
import { Order, OrderDocument } from 'src/orders/schema/orders.schema';
import { Table, TableDocument } from 'src/tables/schema/table.schema';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { OrderStatus } from 'src/infrastructure/enums/order-status.enum';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getSummary() {
    const [
      totalMenus,
      totalOrders,
      pendingOrders,
      activeTables,
      totalUsers,
    ] = await Promise.all([
      this.menuModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }),
      this.tableModel.countDocuments({ status: TableStatus.OCCUPIED }),
      this.userModel.countDocuments(),
    ]);

    return {
      totalMenus,
      totalOrders,
      pendingOrders,
      activeTables,
      totalUsers,
    };
  }
}