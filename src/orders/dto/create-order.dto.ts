import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';


export class OrderItemDto {
    @IsMongoId()
    menuItemId: string;

    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {

    @IsString()
    tableToken: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
