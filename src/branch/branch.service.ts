import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Branch, BranchDocument } from './schema/branch.schema';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchService {

  constructor(
    @InjectModel(Branch.name)
    private branchModel: Model<BranchDocument>,
  ) {}

  async createBranch(createBranchDto: CreateBranchDto, hotelId: string) {

    const branch = new this.branchModel({
      ...createBranchDto,
      hotelId: new Types.ObjectId(hotelId),
    });

    return branch.save();
  }

  async findAllBranches() {
    return this.branchModel.find().populate('hotelId');
  }

  async findBranchById(id: string) {

    const branch = await this.branchModel.findById(id);

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }
}