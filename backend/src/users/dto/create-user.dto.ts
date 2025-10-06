import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  password: string;
}
