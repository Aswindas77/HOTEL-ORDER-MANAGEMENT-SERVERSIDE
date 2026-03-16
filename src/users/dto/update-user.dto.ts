import { IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from 'src/infrastructure/enums/role.enums';

export class UpdateUserDto {

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  isActive?: boolean;

  // 🔽 ADD THESE
  @IsOptional()
  hotelId?: string;

  @IsOptional()
  setupStep?: number;
}