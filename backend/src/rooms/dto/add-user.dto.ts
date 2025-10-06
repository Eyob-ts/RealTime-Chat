import { IsNumber, IsNotEmpty } from 'class-validator';

export class AddUserDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
