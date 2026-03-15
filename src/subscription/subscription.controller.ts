import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {

  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Post()
  createSubscription(@Body() body: CreateSubscriptionDto) {

    const hotelId = body.hotelId;

    return this.subscriptionService.createSubscription(body, hotelId);

  }

  @Get()
  getSubscription(@Req() req) {

    const hotelId = req.user?.hotelId || "TEMP_HOTEL_ID";

    return this.subscriptionService.getHotelSubscription(hotelId);
  }

  @Get('expiring')
  getExpiringSubscriptions() {
    return this.subscriptionService.getExpiringSubscriptions();
  }
}