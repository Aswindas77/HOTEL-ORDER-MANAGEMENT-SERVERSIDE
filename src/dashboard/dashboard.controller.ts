import { Controller, Get, Query, Post, Body, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('summary')
  getDashboardSummary(@Req() req) {
     const user = req.user;

    return this.dashboardService.getSummary(
      user.hotelId,
      user.branchId
    );
  }

  @Get('order-analytics')
  getOrderAnalytics(
    @Req() req,
    @Query('period') period?: 'week' | 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    
  ) {
    const user = req.user;

    return this.dashboardService.getOrderAnalytics(period, startDate, endDate, user.hotelId,
      user.branchId
    );
  }

  @Get('table-status')
  getTableStatus(@Req() req) {

    const user = req.user;
    return this.dashboardService.getTableStatus(      user.hotelId,
      user.branchId);
  }

  @Get('recent-orders')
  getRecentOrders(@Req() req) {
    const user = req.user;
    return this.dashboardService.getRecentOrders(      user.hotelId,
      user.branchId);
  }

  @Get('top-items')
  getTopItems(@Req() req) {
    const user = req.user;
    return this.dashboardService.getTopMenuItems(      user.hotelId,
      user.branchId);
  }

  @Get('menu-breakdown')
  getMenuBreakdown(@Req() req) {
    const user = req.user;
    return this.dashboardService.getMenuBreakdown(      user.hotelId,
      user.branchId);
  }
  
}