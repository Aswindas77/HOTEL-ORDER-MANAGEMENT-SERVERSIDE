import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('summary')
  getDashboardSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('order-analytics')
  getOrderAnalytics(
    @Query('period') period?: 'week' | 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getOrderAnalytics(period, startDate, endDate);
  }

  @Get('table-status')
getTableStatus() {
  return this.dashboardService.getTableStatus();
}

@Get('recent-orders')
getRecentOrders() {
  return this.dashboardService.getRecentOrders();
}

@Get('top-items')
getTopItems() {
  return this.dashboardService.getTopMenuItems();
}

@Get('menu-breakdown')
getMenuBreakdown() {
  return this.dashboardService.getMenuBreakdown();
}
}