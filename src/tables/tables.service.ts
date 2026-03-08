import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableDocument } from './schema/table.schema';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';
import { randomBytes } from 'crypto';

@Injectable()
export class TablesService {
    constructor(
        @InjectModel(Table.name)
        private tableModel: Model<TableDocument>,
    ) { }

    async create(createTableDto: CreateTableDto) {
        const existing = await this.tableModel.findOne({
            tableNumber: createTableDto.tableNumber,
        });

        if (existing) {
            throw new BadRequestException('Table number already exists');
        }

        const accessToken = randomBytes(16).toString('hex');

        const table = new this.tableModel({
            ...createTableDto,
            accessToken
        });
        return table.save();
    }

async findAll(
  page = 1,
  limit = 12,
  search?: string,
  status?: TableStatus,
) {

  const query: any = { isActive: true };

  if (search) {
    query.tableNumber = { $regex: search, $options: 'i' };
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [tables, total] = await Promise.all([
    this.tableModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    this.tableModel.countDocuments(query),
  ]);

  return {
    data: tables,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

    async findOne(id: string) {
        const table = await this.tableModel.findById(id);

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        return table;
    }

    async update(id: string, updateTableDto: UpdateTableDto) {

        const updatedTable = await this.tableModel.findByIdAndUpdate(
            id,
            { $set: updateTableDto },
            { returnDocument: 'after' }
        );

        if (!updatedTable) {
            throw new NotFoundException('Table not found');
        }

        return updatedTable;
    }


    async remove(id: string) {
        const table = await this.tableModel.findById(id);

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        table.isActive = false;
        return table.save();
    }

    async openTable(id: string) {
        const table = await this.tableModel.findById(id);

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        if (table.status !== TableStatus.AVAILABLE) {
            throw new BadRequestException('Table is not available to open');
        }

        table.status = TableStatus.OCCUPIED;

        return table.save();
    }

    async closeTable(id: string) {
        const table = await this.tableModel.findById(id);

        if (!table) {
            throw new NotFoundException('Table not found');
        }

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
