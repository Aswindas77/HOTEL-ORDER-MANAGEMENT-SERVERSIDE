import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Branch, BranchDocument } from './schema/branch.schema';
import { CreateBranchDto } from './dto/create-branch.dto';
import { Hotel, HotelDocument } from 'src/hotel/schema/hotel.scehma';
import { User, UserDocument } from 'src/users/schema/user.schema';

@Injectable()
export class BranchService {

  constructor(
    @InjectModel(Branch.name)
    private branchModel: Model<BranchDocument>,
    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) { }

  async createBranch(createBranchDto: CreateBranchDto) {

    const branch = new this.branchModel({
      ...createBranchDto,
      hotelId: new Types.ObjectId(createBranchDto.hotelId)
    });

    const savedBranch = await branch.save();

    await this.userModel.findOneAndUpdate(
      { hotelId: createBranchDto.hotelId },
      {
        branchId: savedBranch._id,
        setupStep: 3
      }
    );

    return savedBranch;
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