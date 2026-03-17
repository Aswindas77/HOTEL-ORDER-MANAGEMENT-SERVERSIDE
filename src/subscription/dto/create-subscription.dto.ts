import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {

  @IsString()
  planType: string;

  @IsNumber()
  branchCount: number;

  @IsString()
  hotelId: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}