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

async getOrderAnalytics(
  period?: 'week' | 'month',
  startDate?: string,
  endDate?: string,
) {

  const now = new Date();
  let start: Date;
  let end: Date = now;

  // Custom filter
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  // Week default (last 7 days)
  else if (period === 'week') {
    start = new Date();
    start.setDate(now.getDate() - 6);
  }

  // Month default (last 30 days)
  else if (period === 'month') {
    start = new Date();
    start.setDate(now.getDate() - 29);
  }

  else {
    start = new Date();
    start.setDate(now.getDate() - 6);
  }

  // Decide grouping field
  let groupField: any;
  let labels: string[];

  if (period === 'month') {

    groupField = { $month: "$createdAt" };

    labels = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ];

  } else {

    groupField = { $dayOfWeek: "$createdAt" };

    labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  }

  const data = await this.orderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          period: groupField,
          status: "$status"
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const confirmed = Array(labels.length).fill(0);
  const pending = Array(labels.length).fill(0);
  const served = Array(labels.length).fill(0);

  data.forEach(d => {

    const index = d._id.period - 1;

    if (d._id.status === 'PENDING')
      pending[index] += d.count;

    if (d._id.status === 'PREPARING' || d._id.status === 'READY')
      confirmed[index] += d.count;

    if (d._id.status === 'SERVED' || d._id.status === 'COMPLETED')
      served[index] += d.count;

  });

  return { labels, confirmed, pending, served };
}


async getTableStatus() {

  const tables = await this.tableModel.find(
    { isActive: true },
    { tableNumber: 1, status: 1 }
  ).sort({ tableNumber: 1 });

  const available = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupied = tables.filter(t => t.status === 'OCCUPIED').length;

  return {
    available,
    occupied,
    tables
  };

}

async getRecentOrders() {

  const orders = await this.orderModel
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return orders.map((order: any) => ({

    item: order.items?.[0]?.name || 'Item',

    table: order.tableNumber,

    qty: order.items?.[0]?.quantity || 1,

    amount: order.grandTotal,

    status: order.status,

    time: this.getTimeAgo(order.createdAt)

  }));

}

private getTimeAgo(date: Date): string {

  const now = new Date().getTime();
  const past = new Date(date).getTime();

  const diff = now - past;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';

  if (minutes < 60) return `${minutes} min ago`;

  if (hours < 24) return `${hours} hr ago`;

  return `${days} day ago`;

}

async getTopMenuItems() {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = await this.orderModel.aggregate([

    // 1. Filter today's orders
    {
      $match: {
        createdAt: { $gte: today }
      }
    },

    // 2. Unwind items array
    {
      $unwind: "$items"
    },

    // 3. Group by item name
    {
      $group: {
        _id: "$items.name",
        totalOrders: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.total" }
      }
    },

    // 4. Sort by most ordered
    {
      $sort: { totalOrders: -1 }
    },

    // 5. Limit top 5
    {
      $limit: 5
    }

  ]);

  return data.map(item => ({
    name: item._id,
    orders: item.totalOrders,
    revenue: item.revenue
  }));

}

}