import { IsString, MinLength } from "class-validator";

export class CreateChatDto {
    @IsString()
    @MinLength(3)
    name: string;
}
