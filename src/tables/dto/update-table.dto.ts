import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';


export class UpdateTableDto {

  @IsOptional()
  tableNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  isActive?: boolean;
}
