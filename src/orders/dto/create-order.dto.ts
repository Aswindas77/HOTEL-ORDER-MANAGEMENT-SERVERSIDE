import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from 'src/infrastructure/enums/order-status.enum';


export class OrderItemDto {
    @IsMongoId()
    menuItemId: string;

    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {

    @IsOptional()
    tableNumber?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
