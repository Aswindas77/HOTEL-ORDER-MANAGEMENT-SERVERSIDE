import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument } from './schema/menu.schema';
import { CategoriesService } from './categories/categories.service';

@Injectable()
export class MenuService {
    constructor(
        @InjectModel(Menu.name)
        private menuModel: Model<MenuDocument>,
        private categoriesservice: CategoriesService,
    ) { }


    async create(dto: CreateMenuDto) {

        const existing = await this.menuModel.findOne({
            name: dto.name.trim(),
            hotelId: dto.hotelId,
            branchId: dto.branchId,
        });

        if (existing) {
            throw new BadRequestException('Menu item already exists');
        }

        return this.menuModel.create({
            ...dto,
            name: dto.name.trim(),
        });
    }

    // GET ALL (with optional filters)
    async findAll(hotelId:string,branchId:string,category?: string, foodType?: string, search?: string,) {

        const filter: any = { hotelId,branchId,isAvailable: true };

        if (category) filter.category = category;
        if (foodType) filter.foodType = foodType;
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        return this.menuModel.find(filter);
    }

    // GET ONE
    async findOne(id: string,hotelId,branchId) {
    const menu = await this.menuModel.findOne({
        _id: id,
        hotelId,
        branchId,
    });
        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        return menu;
    }

    // UPDATE
    async update(id: string, dto: UpdateMenuDto,hotelId: string, branchId: string) {

        const menu = await this.menuModel.findOne({
            _id: id,
            hotelId,
            branchId,
        });
        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        Object.assign(menu, dto);
        return menu.save();
    }

    // SOFT DELETE
    async disable(id: string,hotelId: string, branchId: string) {

    const menu = await this.menuModel.findOne({
        _id: id,
        hotelId,
        branchId,
    });

        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        menu.isAvailable = false;
        return menu.save();
    }

    // ENABLE
    async enable(id: string,hotelId: string, branchId: string) {

    const menu = await this.menuModel.findOne({
        _id: id,
        hotelId,
        branchId,
    });       
       
        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        menu.isAvailable = true;
        return menu.save();
    }
  
    async findAllForAdmin(
  category?: string,
  foodType?: string,
  search?: string,
  hotelId?:string,
  branchId?:string,
) {
  const filter: any = {hotelId,branchId};

  if (category) filter.category = category;
  if (foodType) filter.foodType = foodType;
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  return this.menuModel.find(filter);
}
}
