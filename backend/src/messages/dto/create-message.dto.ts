import { IsString, MinLength, IsInt } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @MinLength(1)
    text: string;

    @IsInt()
    userId: number;

    @IsInt()
    chatRoomId: number;

}
