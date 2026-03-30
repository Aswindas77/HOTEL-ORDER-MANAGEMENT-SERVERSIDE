import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';
import { MenuService } from 'src/menu/menu.service';

@Controller('tables')
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
    private readonly menuService:MenuService
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTableDto, @Req() req) {
    return this.tablesService.create(dto, req.user);
  }

  //  FIXED
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Req() req,
    @Query('branchId') branchId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: TableStatus,
  ) {
    return this.tablesService.findAll(
      req.user,
      branchId,
      Number(page) || 1,
      Number(limit) || 12,
      search,
      status,
    );
  }

  //  FIXED
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.tablesService.findOne(id, req.user, branchId);
  }

  //  FIXED
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.tablesService.update(id, dto, req.user, branchId);
  }

  //  FIXED
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.tablesService.remove(id, req.user, branchId);
  }

  //  FIXED
  @Patch(':id/open')
  @UseGuards(JwtAuthGuard)
  open(
    @Param('id') id: string,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.tablesService.openTable(id, req.user, branchId);
  }

  //  FIXED
  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  close(
    @Param('id') id: string,
    @Req() req,
    @Query('branchId') branchId: string,
  ) {
    return this.tablesService.closeTable(id, req.user, branchId);
  }

  @Get('verify/:token')
  verifyTable(@Param('token') token: string) {
    return this.tablesService.verifyByToken(token);
  }

  @Get('by-table/:token')
  getMenuByTable(
    @Param('token') token: string,
    @Query('category') category?: string,
    @Query('foodType') foodType?: string,
    @Query('search') search?: string,
  ) {
    return this.menuService.getMenuByTable(
      token,
      category,
      foodType,
      search,
    );
  }
}