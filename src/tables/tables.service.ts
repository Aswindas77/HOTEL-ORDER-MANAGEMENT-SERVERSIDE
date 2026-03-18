import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Table, TableDocument } from './schema/table.schema';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';
import { randomBytes } from 'crypto';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { Branch, BranchDocument } from 'src/branch/schema/branch.schema';

@Injectable()
export class TablesService {
    constructor(
        @InjectModel(Table.name)
        private tableModel: Model<TableDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(Branch.name)
        private branchModel: Model<BranchDocument>,
    ) { }

    async create(dto: CreateTableDto, user: any) {

        const userId = user.userId.toString();

        const dbUser = await this.userModel.findById(userId);

        if (!dbUser) {
            throw new NotFoundException('User not found');
        }

        const hotelId = dbUser.hotelId;
        const branchId = dto.branchId;

        const branch = await this.branchModel.findOne({
            _id: new Types.ObjectId(branchId),
            hotelId: new Types.ObjectId(hotelId),
        });


        if (!branch) {
            throw new BadRequestException('Invalid branch for this hotel');
        }

        const existing = await this.tableModel.findOne({
            tableNumber: dto.tableNumber,
            hotelId,
            branchId,
        });

        if (existing) {
            throw new BadRequestException('Table already exists in this branch');
        }

        const accessToken = randomBytes(16).toString('hex');



        const table = new this.tableModel({
            ...dto,
            accessToken,
            hotelId,
            branchId,
        });

        return table.save();
    }

    async findAll(
        user: any,
        branchId: string,
        page = 1,
        limit = 12,
        search?: string,
        status?: TableStatus,
    ) {
        const dbUser = await this.userModel.findById(user.userId);
        if (!dbUser) {
            throw new NotFoundException('User not found');
        }
        const hotelId = dbUser.hotelId;

        const query: any = {
            hotelId: new Types.ObjectId(hotelId),
            branchId: new Types.ObjectId(branchId),
            isActive: true,
        };

        if (search) {
            query.tableNumber = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [tables, total] = await Promise.all([
            this.tableModel.find(query).skip(skip).limit(limit),
            this.tableModel.countDocuments(query),
        ]);

        return {
            data: tables,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string, user: any, branchId: string) {
        const dbUser = await this.userModel.findById(user.userId);
        if (!dbUser) {
            throw new NotFoundException('User not found');
        }
        const hotelId = dbUser.hotelId;

        const table = await this.tableModel.findOne({
            _id: new Types.ObjectId(id),
            hotelId: new Types.ObjectId(hotelId),
            branchId: new Types.ObjectId(branchId),
        });

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        return table;
    }

    async update(id: string, dto: UpdateTableDto, user: any, branchId: string) {
        const dbUser = await this.userModel.findById(user.userId);
        if (!dbUser) {
            throw new NotFoundException('User not found');
        }
        const hotelId = dbUser.hotelId;

        const updatedTable = await this.tableModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                hotelId: new Types.ObjectId(hotelId),
                branchId: new Types.ObjectId(branchId),
            },
            { $set: dto },
            { new: true }
        );

        if (!updatedTable) {
            throw new NotFoundException('Table not found');
        }

        return updatedTable;
    }


    async remove(id: string, user: any, branchId: string) {
        const dbUser = await this.userModel.findById(user.userId);
        if (!dbUser) {
            throw new NotFoundException('User not found');
        }
        const hotelId = dbUser.hotelId;

        const table = await this.tableModel.findOne({
            _id: new Types.ObjectId(id),
            hotelId: new Types.ObjectId(hotelId),
            branchId: new Types.ObjectId(branchId),
        });

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        table.isActive = false;
        return table.save();
    }

    async openTable(id: string, user: any, branchId: string) {
        const table = await this.findOne(id, user, branchId);

        if (table.status !== TableStatus.AVAILABLE) {
            throw new BadRequestException('Table is not available to open');
        }

        table.status = TableStatus.OCCUPIED;
        return table.save();
    }

    async closeTable(id: string, user: any, branchId: string) {
        const table = await this.findOne(id, user, branchId);

        if (table.status !== TableStatus.OCCUPIED) {
            throw new BadRequestException('Table is not currently occupied');
        }

        table.status = TableStatus.AVAILABLE;
        return table.save();
    }

    async verifyByToken(token: string) {

        const table = await this.tableModel.findOne({
            accessToken: token,
            isActive: true
        });

        if (!table) {
            throw new NotFoundException('Invalid table');
        }

        return {
            tableNumber: table.tableNumber
        };
    }

}
