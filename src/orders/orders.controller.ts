import { Controller, Post, Body, Patch, Param, Get, Query } from '@nestjs/common';
import { OrderService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from 'src/infrastructure/enums/order-status.enum';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.orderService.updateStatus(id, status);
  }

  @Patch(':id/pay')
  markPaid(@Param('id') id: string) {
    return this.orderService.markAsPaid(id);
  }

  @Patch(':id/unpay')
  markUnpaid(@Param('id') id: string) {
    return this.orderService.markAsUnpaid(id);
  }

  @Get('chef')
chefOrders(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string,
  @Query('status') status?: OrderStatus,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.orderService.getChefOrders(
    Number(page),
    Number(limit),
    search,
    status,
    startDate,
    endDate,
  );
}

  @Get('manager')
  managerOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.orderService.getManagerOrders(page, limit);
  }

  @Get()
  getOrders(
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.orderService.getOrders(
      status,
      paymentStatus,
      search,
      page,
      limit,
    );
  }
}
