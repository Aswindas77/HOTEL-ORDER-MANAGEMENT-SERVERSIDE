import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateHotelDto {

  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;
}