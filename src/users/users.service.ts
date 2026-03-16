import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.userModel.findOne({
            email: createUserDto.email,
        });

        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(
            createUserDto.password,
            10,
        );

        const user = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        const { password, ...userWithoutPassword } = savedUser.toObject();

        return userWithoutPassword;
    }


    async findAll(
        page = 1,
        limit = 10,
        search?: string,
        role?: string,
        status?: boolean,
    ) {

        const query: any = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        // Role filter
        if (role) {
            query.role = role;
        }

        // Status filter
        if (status !== undefined) {
            query.isActive = status;
        }

        const skip = (page - 1) * limit;

        const users = await this.userModel
            .find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await this.userModel.countDocuments(query);

        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }


    async findOne(id: string) {
        const user = await this.userModel
            .findById(id)
            .select('-password');

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }


    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(
                updateUserDto.password,
                10,
            );
        }

        Object.assign(user, updateUserDto);

        return user.save();
    }


    async remove(id: string) {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isActive = false;

        return user.save();
    }

    async findByEmailWithPassword(email: string) {
        return this.userModel.findOne({ email });
    }

    async findById(id: string) {
        return this.userModel.findById(id);
    }

    async updateSetupStep(userId: string, step: number) {
  return this.userModel.findByIdAndUpdate(
    userId,
    { setupStep: step },
    { new: true }
  );
}
}
