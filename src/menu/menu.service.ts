import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument } from './schema/menu.schema';
import { CategoriesService } from './categories/categories.service';
import { Table, TableDocument } from 'src/tables/schema/table.schema';
import { Hotel } from 'src/hotel/schema/hotel.scehma';
import { Branch } from 'src/branch/schema/branch.schema';

@Injectable()
export class MenuService {

    constructor(
        @InjectModel(Menu.name)
        private menuModel: Model<MenuDocument>,
        @InjectModel(Table.name)
        private tableModel: Model<TableDocument>,
        @InjectModel(Hotel.name) 
        private hotelModel: Model<any>,
        @InjectModel(Branch.name) 
        private branchModel: Model<any>,


        private categoriesservice: CategoriesService,
    ) { }

    // ✅ Safe ObjectId converter
    private toObjectId(id: any): Types.ObjectId {
        if (!id) {
            throw new BadRequestException('ObjectId missing');
        }

        if (typeof id !== 'string') {
            id = id.toString();
        }

        id = id.trim();

        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ObjectId');
        }

        return new Types.ObjectId(id);
    }

    // ✅ CREATE MENU
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
            category: this.toObjectId(dto.category), // ✅ FIXED
        });
    }

    // ✅ GET MENUS (USER SIDE)
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

        if (category) filter.category = this.toObjectId(category); // ✅ FIXED
        if (foodType) filter.foodType = foodType;

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        return this.menuModel.find(filter).populate('category');
    }

    // ✅ GET ONE MENU
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

    // ✅ UPDATE MENU
    async update(
        id: string,
        dto: UpdateMenuDto,
        hotelId: string,
        branchId: string
    ) {

        // ✅ Find menu with proper ObjectId conversion
        const menu = await this.menuModel.findOne({
            _id: this.toObjectId(id),
            hotelId: this.toObjectId(hotelId),
            branchId: this.toObjectId(branchId),
        });

        if (!menu) {
            throw new NotFoundException('Menu item not found');
        }

        // ✅ Create clean update object (DO NOT MODIFY DTO)
        const updateData: any = {
            ...dto,
            hotelId: this.toObjectId(hotelId),   // 🔥 force ObjectId
            branchId: this.toObjectId(branchId), // 🔥 force ObjectId
        };

        // ✅ Convert category if exists
        if (dto.category) {
            updateData.category = this.toObjectId(dto.category);
        }

        // ✅ Assign safely
        Object.assign(menu, updateData);

        // ✅ Save
        return menu.save();
    }

    // ✅ DISABLE MENU
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

    // ✅ ENABLE MENU
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

    // ✅ ADMIN SIDE MENU
    async findAllForAdmin(
        category?: string,
        foodType?: string,
        search?: string,
        hotelId?: string,
        branchId?: string,
    ) {

        const filter: any = {};

        if (hotelId) filter.hotelId = this.toObjectId(hotelId);
        if (branchId) filter.branchId = this.toObjectId(branchId);

        if (category && category.trim() !== '') {
            filter.category = this.toObjectId(category); // ✅ FIXED
        }

        if (foodType && foodType.trim() !== '') {
            filter.foodType = foodType;
        }

        if (search && search.trim() !== '') {
            filter.name = { $regex: search, $options: 'i' };
        }

        return this.menuModel.find(filter).populate('category');
    }

    // ✅ MENU FOR TABLE (QR)
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

        if (category) {
            filter.category = this.toObjectId(category);
        }

        if (foodType) {
            filter.foodType = foodType;
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // ✅ MENU
        const menu = await this.menuModel
            .find(filter)
            .populate('category');

        // ✅ ALL CATEGORIES
        const categories = await this.categoriesservice.findAllByBranch(
            table.branchId
        );

        // 🔥 NEW PART (IMPORTANT)
        const hotel = await this.hotelModel.findById(table.hotelId);
        const branch = await this.branchModel.findById(table.branchId);

        // ✅ FINAL RESPONSE
        return {
            menu,
            categories,
            hotel,
            branch
        };
    }
}