import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean, Min, } from 'class-validator';
import { FoodType, MenuCategory } from 'src/infrastructure/enums/menu.enum';

export class CreateMenuDto {

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(MenuCategory)
    category: MenuCategory;

    @IsEnum(FoodType)
    foodType: FoodType;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    preparationTime?: number;
}
