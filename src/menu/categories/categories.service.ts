import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {

  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) { }


  private getHotelAndBranch(user: any) {

    if (!user?.hotelId || !user?.branchId) {
      throw new BadRequestException('Invalid user token');
    }

    return {
      hotelId: new Types.ObjectId(user.hotelId),
      branchId: new Types.ObjectId(user.branchId),
    };
  }


  async create(dto: CreateCategoryDto, user: any) {

    const { hotelId, branchId } = this.getHotelAndBranch(user);

    const name = dto.name.trim();
    const existing = await this.categoryModel.findOne({
      hotelId,
      branchId,
      name: { $regex: `^${name}$`, $options: 'i' }
    });

    if (existing) {
      throw new BadRequestException('Category already exists');
    }

    return this.categoryModel.create({
      name: dto.name.trim(),
      hotelId,
      branchId,
    });
  }


  async findAll(user: any) {

    const { hotelId, branchId } = this.getHotelAndBranch(user);

    return this.categoryModel
      .find({ hotelId, branchId })
      .sort({ name: 1 });
  }


  async update(id: string, dto: UpdateCategoryDto, user: any) {

    const { hotelId, branchId } = this.getHotelAndBranch(user);

    const name = dto.name?.trim();

    if (name) {
      const existing = await this.categoryModel.findOne({
        _id: { $ne: new Types.ObjectId(id) },
        hotelId,
        branchId,
        name: { $regex: `^${name}$`, $options: 'i' }
      });

      if (existing) {
        throw new BadRequestException('Category already exists');
      }
    }

    const category = await this.categoryModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        hotelId,
        branchId,
      },
      {
        name,
      },
      { new: true }
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }


  async remove(id: string, user: any) {

    const { hotelId, branchId } = this.getHotelAndBranch(user);

    const category = await this.categoryModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      hotelId,
      branchId,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }

  async findAllByBranch(branchId: Types.ObjectId) {
    return this.categoryModel
      .find({ branchId })
      .sort({ name: 1 });
  }
}