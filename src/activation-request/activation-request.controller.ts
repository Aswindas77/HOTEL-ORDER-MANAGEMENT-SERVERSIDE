import { Controller, Post, Body, Get, Patch, Param, Req } from '@nestjs/common';
import { ActivationRequestService } from './activation-request.service';
import { CreateActivationRequestDto } from './dto/create-activation-request.dto';

@Controller('activation-request')
export class ActivationRequestController {

  constructor(
    private readonly activationService: ActivationRequestService
  ) {}

  @Post()
  createRequest(
    @Body() body: CreateActivationRequestDto,
    @Req() req
  ) {

    const hotelId = req.user?.hotelId || "TEMP_HOTEL_ID";

    return this.activationService.createRequest(
      hotelId,
      body.subscriptionId
    );
  }

  @Get()
  getRequests() {
    return this.activationService.getRequests();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.activationService.approveRequest(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.activationService.rejectRequest(id);
  }
}