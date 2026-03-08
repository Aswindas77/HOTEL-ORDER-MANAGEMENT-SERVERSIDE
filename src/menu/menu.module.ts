import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu, MenuSchema } from './schema/menu.schema';
import { CategoriesModule } from './categories/categories.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Menu.name, schema: MenuSchema },
        ]),
        CategoriesModule,
    ],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService],
})
export class MenuModule { }
