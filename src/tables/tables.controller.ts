import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) { }

    @Post()
    create(@Body() createTableDto: CreateTableDto) {
        return this.tablesService.create(createTableDto);
    }

    @Get()
    findAll() {
        return this.tablesService.findAll();
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
