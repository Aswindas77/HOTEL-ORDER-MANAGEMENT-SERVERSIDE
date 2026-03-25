import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu, MenuSchema } from './schema/menu.schema';
import { CategoriesModule } from './categories/categories.module';
import { Table, TableSchema } from 'src/tables/schema/table.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Menu.name, schema: MenuSchema },
            { name: Table.name, schema: TableSchema },
        ]),
        CategoriesModule,
    ],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService],
})
export class MenuModule { }
