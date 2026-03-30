import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from 'src/infrastructure/enums/order-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //  CREATE (public - via table token)
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  //  UPDATE STATUS
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.orderService.updateStatus(id, status, req.user, branchId);
  }

  // MARK PAID
  @Patch(':id/pay')
  @UseGuards(JwtAuthGuard)
  markPaid(
    @Param('id') id: string,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.orderService.markAsPaid(id, req.user, branchId);
  }

  //  MARK UNPAID
  @Patch(':id/unpay')
  @UseGuards(JwtAuthGuard)
  markUnpaid(
    @Param('id') id: string,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.orderService.markAsUnpaid(id, req.user, branchId);
  }

  //  CHEF ORDERS
  @Get('chef')
  @UseGuards(JwtAuthGuard)
  chefOrders(
    @Req() req,
    @Query('branchId') branchId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: OrderStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.getChefOrders(
      req.user,
      branchId,
      Number(page),
      Number(limit),
      search,
      status,
      startDate,
      endDate,
    );
  }

  //  MANAGER ORDERS
  @Get('manager')
  @UseGuards(JwtAuthGuard)
  managerOrders(
    @Req() req,
    @Query('branchId') branchId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.orderService.getManagerOrders(
      req.user,
      branchId,
      page,
      limit,
    );
  }

  //  ALL ORDERS
  @Get()
  @UseGuards(JwtAuthGuard)
  getOrders(
    @Req() req,
    @Query('branchId') branchId: string,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.orderService.getOrders(
      req.user,
      branchId,
      status,
      paymentStatus,
      search,
      page,
      limit,
    );
  }
}