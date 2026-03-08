import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {

  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto);
  }

  async findAll() {
    return this.categoryModel.find().sort({ name: 1 });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    if (!category) throw new NotFoundException('Category not found');

    return category;
  }

  async remove(id: string) {

    const category = await this.categoryModel.findByIdAndDelete(id);

    if (!category) throw new NotFoundException('Category not found');

    return { message: 'Category deleted successfully' };

  }

}