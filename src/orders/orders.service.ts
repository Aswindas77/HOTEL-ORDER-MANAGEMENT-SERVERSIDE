import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schema/orders.schema';
import { Menu, MenuDocument } from 'src/menu/schema/menu.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, OrderType, PaymentStatus } from 'src/infrastructure/enums/order-status.enum';
import { Table, TableDocument } from 'src/tables/schema/table.schema';


@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name)
        private orderModel: Model<OrderDocument>,

        @InjectModel(Menu.name)
        private menuModel: Model<MenuDocument>,

        @InjectModel(Table.name)
        private tableModel: Model<TableDocument>,
    ) { }


    async create(dto: CreateOrderDto) {

        if (!dto.tableToken) {
            throw new BadRequestException('Table token required');
        }

        const table = await this.tableModel.findOne({
            accessToken: dto.tableToken.toLowerCase(),
            isActive: true
        });

        if (!table) {
            throw new BadRequestException('Invalid or inactive table');
        }

        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Items required');
        }

        const menuIds = dto.items.map(item => item.menuItemId);

        const menuItems = await this.menuModel.find({
            _id: { $in: menuIds }
        });

        if (menuItems.length !== dto.items.length) {
            throw new BadRequestException('Invalid menu item');
        }

        let subtotal = 0;

        const items = dto.items.map(item => {

            if (item.quantity <= 0) {
                throw new BadRequestException('Invalid quantity');
            }

            const menu = menuItems.find(
                m => m._id.toString() === item.menuItemId
            );

            if (!menu) {
                throw new BadRequestException('Menu item not found');
            }

            if (!menu.isAvailable) {
                throw new BadRequestException('Menu item not available');
            }

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

        const lastOrder = await this.orderModel
            .findOne()
            .sort({ createdAt: -1 });

        const tokenNumber = lastOrder ? lastOrder.tokenNumber + 1 : 1;

        return this.orderModel.create({
            orderNumber: `ORD-${Date.now()}`,
            tableNumber: table.tableNumber,
            tokenNumber,
            items,
            subtotal,
            tax,
            grandTotal,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.UNPAID,
        });
    }



    async updateStatus(orderId: string, status: OrderStatus) {

        const order = await this.orderModel.findById(orderId);
        if (!order) throw new NotFoundException('Order not found');

        const validTransitions = {
            [OrderStatus.PENDING]: [OrderStatus.PREPARING],
            [OrderStatus.PREPARING]: [
                OrderStatus.READY,
                OrderStatus.PENDING
            ],
            [OrderStatus.READY]: [
                OrderStatus.SERVED,
                OrderStatus.PREPARING
            ],
            [OrderStatus.SERVED]: [
                OrderStatus.COMPLETED,
                OrderStatus.READY
            ],
        };


        if (!validTransitions[order.status]?.includes(status)) {
            throw new BadRequestException('Invalid status transition');
        }


        if (
            status === OrderStatus.COMPLETED &&
            order.paymentStatus !== PaymentStatus.PAID
        ) {
            throw new BadRequestException(
                'Cannot complete unpaid order',
            );
        }

        order.status = status;

        return order.save();
    }


    async markAsPaid(orderId: string) {
        const order = await this.orderModel.findById(orderId);
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== OrderStatus.SERVED) {
            throw new BadRequestException(
                'Order must be served before payment',
            );
        }

        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Already paid');
        }

        order.paymentStatus = PaymentStatus.PAID;

        return order.save();
    }

    async markAsUnpaid(orderId: string) {
        const order = await this.orderModel.findById(orderId);
        if (!order) throw new NotFoundException('Order not found');

        if (order.paymentStatus === PaymentStatus.UNPAID) {
            throw new BadRequestException('Already unpaid');
        }

        order.paymentStatus = PaymentStatus.UNPAID;

        if (order.status === OrderStatus.COMPLETED) {
            order.status = OrderStatus.SERVED;
        }

        return order.save();
    }



    async getChefOrders(
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


        const filter: any = {};

        const chefStatuses = [
            OrderStatus.PENDING,
            OrderStatus.PREPARING,
            OrderStatus.READY
        ];

        
        filter.status = status
            ? status
            : { $in: chefStatuses };

        // 🔎 Search by tableNumber or tokenNumber
        if (search) {

            const numeric = Number(search);

            filter.$or = [
                { tableNumber: { $regex: search, $options: 'i' } },
                { orderNumber: { $regex: search, $options: 'i' } },
                { "items.name": { $regex: search, $options: "i" } },
                ...(Number.isNaN(numeric) ? [] : [{ tokenNumber: numeric }])
            ];

        }

        // 📅 Date filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
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



    async getManagerOrders(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const filter = {
            status: OrderStatus.SERVED,
            paymentStatus: PaymentStatus.UNPAID,
        };

        const [orders, total] = await Promise.all([
            this.orderModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.orderModel.countDocuments(filter),
        ]);

        return {
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: orders,
        };
    }

    async getOrders(
        status?: OrderStatus,
        paymentStatus?: PaymentStatus,
        search?: string,
        page: number = 1,
        limit: number = 10,
    ) {
        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { tokenNumber: Number(search) || 0 },
                { "items.name": { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.orderModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
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
