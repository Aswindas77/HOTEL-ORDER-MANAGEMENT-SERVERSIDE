import { IsString } from 'class-validator';

export class CreateBranchDto {

  @IsString()
  branchName: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;
}