import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { TableStatus } from 'src/infrastructure/enums/tableStatus.enums';


export class CreateTableDto {

  @IsNotEmpty()
  tableNumber: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsEnum(TableStatus)
  status: TableStatus;
}
