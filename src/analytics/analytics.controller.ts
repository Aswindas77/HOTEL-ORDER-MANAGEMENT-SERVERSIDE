import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {

  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAnalytics() {
    return this.analyticsService.getAnalytics();
  }
}