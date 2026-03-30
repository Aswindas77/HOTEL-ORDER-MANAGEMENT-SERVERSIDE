import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ActivationRequestService } from './activation-request.service';
import { CreateActivationRequestDto } from './dto/create-activation-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activation-request')
export class ActivationRequestController {

  constructor(private readonly activationService: ActivationRequestService) { }


  @Post()
  @UseGuards(JwtAuthGuard)
  createRequest(@Body() body: CreateActivationRequestDto, @Req() req) {
    return this.activationService.createRequest(req.user, body.subscriptionId);
  }


  @Get()
  @UseGuards(JwtAuthGuard)
  getRequests(
    @Req() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    return this.activationService.getRequests(req.user, page, limit, search, status);
  }


  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Param('id') id: string, @Req() req) {
    return this.activationService.approveRequest(id, req.user);
  }


  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(@Param('id') id: string, @Req() req) {
    return this.activationService.rejectRequest(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyRequest(@Req() req) {
    return this.activationService.getMyLatestRequest(req.user);
  }
}