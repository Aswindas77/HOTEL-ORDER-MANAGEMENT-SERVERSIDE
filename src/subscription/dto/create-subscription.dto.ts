import { IsString, IsNumber } from 'class-validator';

export class CreateSubscriptionDto {

  @IsString()
  planType: string;

  @IsNumber()
  branchCount: number;
}