import { Controller, Post, Body, Get, Param, Patch, Query, Req, UseGuards, } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Get()
  findAll(
    @Query('hotelId') hotelId: string,
    @Query('branchId') branchId: string,
    @Query('category') category?: string,
    @Query('foodType') foodType?: string,
    @Query('search') search?: string,
  ) {
    return this.menuService.findAll(
      hotelId,
      branchId,
      category,
      foodType,
      search,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin(
    @Query('category') category: string,
    @Query('foodType') foodType: string,
    @Query('search') search: string,
    @Req() req,
  ) {
    const user = req.user;

    return this.menuService.findAllForAdmin(
      category,
      foodType,
      search,
      user.hotelId,
      user.branchId,
    );
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

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('hotelId') hotelId: string,
    @Query('branchId') branchId: string,
  ) {
    return this.menuService.findOne(id, hotelId, branchId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuDto,
    @Query('hotelId') hotelId: string,
    @Query('branchId') branchId: string,
  ) {
    return this.menuService.update(id, dto, hotelId, branchId);
  }

  @Patch(':id/disable')
  disable(
    @Param('id') id: string,
    @Query('hotelId') hotelId: string,
    @Query('branchId') branchId: string,
  ) {
    return this.menuService.disable(id, hotelId, branchId);
  }

  @Patch(':id/enable')
  enable(
    @Param('id') id: string,
    @Query('hotelId') hotelId: string,
    @Query('branchId') branchId: string,
  ) {
    return this.menuService.enable(id, hotelId, branchId);
  }

}