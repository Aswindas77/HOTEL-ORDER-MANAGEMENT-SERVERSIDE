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

        return user.save();
    }


    async findAll() {
        return this.userModel.find().select('-password');
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
}
