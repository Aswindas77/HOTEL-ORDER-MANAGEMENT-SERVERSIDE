import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument } from './schema/menu.schema';
import { CategoriesService } from './categories/categories.service';
import { Table, TableDocument } from 'src/tables/schema/table.schema';

@Injectable()
export class MenuService {

    constructor(
        @InjectModel(Menu.name)
        private menuModel: Model<MenuDocument>,
        @InjectModel(Table.name)
        private tableModel: Model<TableDocument>,

        private categoriesservice: CategoriesService,
    ) { }


    private toObjectId(id: any): Types.ObjectId {
        if (!id || !Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId');
        }
        return new Types.ObjectId(id);
    }


    async create(dto: CreateMenuDto) {

        const hotelId = this.toObjectId(dto.hotelId);
        const branchId = this.toObjectId(dto.branchId);

        const existing = await this.menuModel.findOne({
            name: dto.name.trim(),
            hotelId,
            branchId,
        });

        if (existing) {
            throw new BadRequestException('Menu item already exists');
        }

        return this.menuModel.create({
            ...dto,
            name: dto.name.trim(),
            hotelId,
            branchId,
        });
    }


    async findAll(
        hotelId: string,
        branchId: string,
        category?: string,
        foodType?: string,
        search?: string,
    ) {

        const filter: any = {
            hotelId: this.toObjectId(hotelId),
            branchId: this.toObjectId(branchId),
            isAvailable: true,
        };

        if (category) filter.category = category;
        if (foodType) filter.foodType = foodType;

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        return this.menuModel.find(filter);
    }


    async findOne(id: string, hotelId: string, branchId: string) {

        const menu = await this.menuModel.findOne({
            _id: this.toObjectId(id),
            hotelId: this.toObjectId(hotelId),
            branchId: this.toObjectId(branchId),
        });

        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        return menu;
    }


    async update(id: string, dto: UpdateMenuDto, hotelId: string, branchId: string) {

        const menu = await this.menuModel.findOne({
            _id: this.toObjectId(id),
            hotelId: this.toObjectId(hotelId),
            branchId: this.toObjectId(branchId),
        });

        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        Object.assign(menu, dto);
        return menu.save();
    }


    async disable(id: string, hotelId: string, branchId: string) {

        const menu = await this.menuModel.findOne({
            _id: this.toObjectId(id),
            hotelId: this.toObjectId(hotelId),
            branchId: this.toObjectId(branchId),
        });

        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        menu.isAvailable = false;
        return menu.save();
    }


    async enable(id: string, hotelId: string, branchId: string) {

        const menu = await this.menuModel.findOne({
            _id: this.toObjectId(id),
            hotelId: this.toObjectId(hotelId),
            branchId: this.toObjectId(branchId),
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
        hotelId?: string,
        branchId?: string,
    ) {

        const filter: any = {};

        const hId = this.toObjectId(hotelId);
        const bId = this.toObjectId(branchId);

        if (hId) filter.hotelId = hId;
        if (bId) filter.branchId = bId;

        if (category && category.trim() !== '') {
            filter.category = category;
        }

        if (foodType && foodType.trim() !== '') {
            filter.foodType = foodType;
        }

        if (search && search.trim() !== '') {
            filter.name = { $regex: search, $options: 'i' };
        }


        return this.menuModel.find(filter);
    }

    async getMenuByTable(
        token: string,
        category?: string,
        foodType?: string,
        search?: string,
    ) {


        const table = await this.tableModel.findOne({
            accessToken: token
        });

        if (!table) {
            throw new NotFoundException('Invalid table token');
        }
        const filter: any = {
            branchId: table.branchId,
            isAvailable: true,
        };

        if (category) filter.category = category;
        if (foodType) filter.foodType = foodType;

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        
        const menu = await this.menuModel.find(filter);
        const categories = [...new Set(menu.map(item => item.category))];

        return {
            menu,
            categories
        };
    }
}