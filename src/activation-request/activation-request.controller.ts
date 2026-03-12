import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { ActivationRequestService } from './activation-request.service';
import { CreateActivationRequestDto } from './dto/create-activation-request.dto';

@Controller('activation-request')
export class ActivationRequestController {

  constructor(
    private readonly activationService: ActivationRequestService
  ) {}

  // CREATE ACTIVATION REQUEST
  @Post()
  createRequest(@Body() body: CreateActivationRequestDto) {

    
    return this.activationService.createRequest(
      body.hotelId,
      body.subscriptionId,
      body.branchId
    );

  }

  // GET ALL REQUESTS
  @Get()
  getRequests() {
    return this.activationService.getRequests();
  }

  // APPROVE REQUEST
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.activationService.approveRequest(id);
  }

  // REJECT REQUEST
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.activationService.rejectRequest(id);
  }

}