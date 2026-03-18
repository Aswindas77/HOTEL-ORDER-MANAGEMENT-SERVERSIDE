import { Controller, Post, Body, Get, Param, Patch, Query, } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Post()
    create(@Body() dto: CreateMenuDto) {
        return this.menuService.create(dto);
    }

    @Get()
    findAll(
        @Query('category') category?: string,
        @Query('foodType') foodType?: string,
        @Query('search') search?: string,
    ) {
        return this.menuService.findAll(category, foodType, search);
    }

    @Get('admin')
    findAllForAdmin(
        @Query('category') category?: string,
        @Query('foodType') foodType?: string,
        @Query('search') search?: string,
    ) {
        return this.menuService.findAllForAdmin(category, foodType, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.menuService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
        return this.menuService.update(id, dto);
    }

    @Patch(':id/disable')
    disable(@Param('id') id: string) {
        return this.menuService.disable(id);
    }

    @Patch(':id/enable')
    enable(@Param('id') id: string) {
        return this.menuService.enable(id);
    }
}
