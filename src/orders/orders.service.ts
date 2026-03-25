import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument } from './schema/orders.schema';
import { Menu, MenuDocument } from 'src/menu/schema/menu.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderStatus,
  PaymentStatus,
} from 'src/infrastructure/enums/order-status.enum';
import { Table, TableDocument } from 'src/tables/schema/table.schema';
import { User, UserDocument } from 'src/users/schema/user.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,

    @InjectModel(Menu.name)
    private menuModel: Model<MenuDocument>,

    @InjectModel(Table.name)
    private tableModel: Model<TableDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // ───────── CREATE ORDER ─────────

  async create(dto: CreateOrderDto) {
    const table = await this.tableModel.findOne({
      accessToken: dto.tableToken.toLowerCase(),
      isActive: true,
    });

    if (!table) throw new BadRequestException('Invalid table');

    const hotelId = table.hotelId;
    const branchId = table.branchId;

    const menuIds = dto.items.map(
      (i) => new Types.ObjectId(i.menuItemId),
    );

    const menuItems = await this.menuModel.find({
      _id: { $in: menuIds },
      hotelId,
      branchId,
    });

    let subtotal = 0;

    const items = dto.items.map((item) => {
      const menu = menuItems.find(
        (m) => m._id.toString() === item.menuItemId,
      );

      if (!menu) throw new BadRequestException('Invalid menu item');

      const total = menu.price * item.quantity;
      subtotal += total;

      return {
        menuItemId: menu._id,
        name: menu.name,
        price: menu.price,
        quantity: item.quantity,
        total,
      };
    });

    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;

    return this.orderModel.create({
      orderNumber: `ORD-${Date.now()}`,
      tokenNumber: Math.floor(Math.random() * 1000),
      tableNumber: table.tableNumber,
      items,
      subtotal,
      tax,
      grandTotal,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      hotelId,
      branchId,
    });
  }

  // ───────── COMMON CONTEXT (FIXED 🔥) ─────────

  private async getContext(user: any, branchId: string) {
    const dbUser = await this.userModel.findById(
      user.userId.toString(),
    );

    if (!dbUser) throw new NotFoundException('User not found');

    // 🔥 FIX: VALIDATION ADDED
    if (!branchId || !Types.ObjectId.isValid(branchId)) {
      throw new BadRequestException('Invalid branchId');
    }

    return {
      hotelId: new Types.ObjectId(dbUser.hotelId),
      branchId: new Types.ObjectId(branchId),
    };
  }

  // ───────── UPDATE STATUS ─────────

  async updateStatus(
    id: string,
    status: OrderStatus,
    user: any,
    branchId: string,
  ) {
    const { hotelId, branchId: bId } = await this.getContext(
      user,
      branchId,
    );

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(id),
      hotelId,
      branchId: bId,
    });

    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    return order.save();
  }

  // ───────── PAYMENT ─────────

  async markAsPaid(id: string, user: any, branchId: string) {
    const { hotelId, branchId: bId } = await this.getContext(
      user,
      branchId,
    );

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(id),
      hotelId,
      branchId: bId,
    });

    if (!order) throw new NotFoundException('Order not found');

    order.paymentStatus = PaymentStatus.PAID;
    return order.save();
  }

  async markAsUnpaid(id: string, user: any, branchId: string) {
    const { hotelId, branchId: bId } = await this.getContext(
      user,
      branchId,
    );

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(id),
      hotelId,
      branchId: bId,
    });

    if (!order) throw new NotFoundException('Order not found');

    order.paymentStatus = PaymentStatus.UNPAID;
    return order.save();
  }

  // ───────── CHEF ORDERS ─────────

  async getChefOrders(
    user: any,
    branchId: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: OrderStatus,
    startDate?: string,
    endDate?: string,
  ) {
    const currentPage = page && page > 0 ? page : 1;
    const currentLimit = limit && limit > 0 ? limit : 10;
    const skip = (currentPage - 1) * currentLimit;

    const { hotelId, branchId: bId } = await this.getContext(
      user,
      branchId,
    );

    const filter: any = {
      hotelId,
      branchId: bId,
    };

    const chefStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PREPARING,
      OrderStatus.READY,
    ];

    filter.status = status ? status : { $in: chefStatuses };

    if (search) {
      const numeric = Number(search);

      filter.$or = [
        { tableNumber: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } },
        ...(Number.isNaN(numeric) ? [] : [{ tokenNumber: numeric }]),
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(currentLimit),

      this.orderModel.countDocuments(filter),
    ]);

    return {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
      data: orders,
    };
  }

  // ───────── MANAGER ORDERS ─────────

  async getManagerOrders(
    user: any,
    branchId: string,
    page = 1,
    limit = 10,
  ) {
    const { hotelId, branchId: bId } = await this.getContext(
      user,
      branchId,
    );

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find({
          hotelId,
          branchId: bId,
          paymentStatus: PaymentStatus.UNPAID,
        })
        .skip(skip)
        .limit(limit),

      this.orderModel.countDocuments({
        hotelId,
        branchId: bId,
        paymentStatus: PaymentStatus.UNPAID,
      }),
    ]);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders,
    };
  }

  // ───────── ALL ORDERS (FIXED 🔥) ─────────

  async getOrders(
    user: any,
    branchId: string,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    const { hotelId, branchId: bId } = await this.getContext(
      user,
      branchId,
    );

    const filter: any = { hotelId, branchId: bId };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search) {
      filter.$or = [
        { tableNumber: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).skip(skip).limit(limit),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders,
    };
  }
}