import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu, MenuSchema } from './schema/menu.schema';
import { CategoriesModule } from './categories/categories.module';
import { Table, TableSchema } from 'src/tables/schema/table.schema';
import { Hotel, HotelSchema } from 'src/hotel/schema/hotel.scehma';
import { Branch, BranchSchema } from 'src/branch/schema/branch.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Menu.name, schema: MenuSchema },
            { name: Table.name, schema: TableSchema },
            { name: Hotel.name, schema: HotelSchema },
            { name: Branch.name, schema: BranchSchema },
        ]),
        CategoriesModule,
    ],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService],
})
export class MenuModule { }
