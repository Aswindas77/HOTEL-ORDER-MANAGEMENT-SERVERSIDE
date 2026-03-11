import { IsString } from 'class-validator';

export class CreateActivationRequestDto {

  @IsString()
  subscriptionId: string;

}