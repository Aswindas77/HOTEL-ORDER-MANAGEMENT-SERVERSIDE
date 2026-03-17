import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';
@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateTableDto, @Req() req) {
        console.log('USER =>', req.user); 
        return this.tablesService.create(dto, req.user);
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('status') status?: TableStatus,
    ) {
        return this.tablesService.findAll(
            Number(page) || 1,
            Number(limit) || 12,
            search,
            status,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tablesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTableDto: UpdateTableDto,
    ) {
        return this.tablesService.update(id, updateTableDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tablesService.remove(id);
    }

    @Patch(':id/open')
    open(@Param('id') id: string) {
        return this.tablesService.openTable(id);
    }

    @Patch(':id/close')
    close(@Param('id') id: string) {
        return this.tablesService.closeTable(id);
    }

    @Get('verify/:token')
    verifyTable(@Param('token') token: string) {
        return this.tablesService.verifyByToken(token);
    }
}
