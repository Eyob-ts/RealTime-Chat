import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  create(createChatDto: CreateChatDto) {
    return this.prisma.chatRoom.create({data: {name: createChatDto.name}});
  }

  findAll() {
    return this.prisma.chatRoom.findMany();
  }

  findOne(id: number) {
    return this.prisma.chatRoom.findUnique({where: {id}});
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return this.prisma.chatRoom.update({where: {id}, data: updateChatDto});
  }

  remove(id: number) {
    return this.prisma.chatRoom.delete({where: {id}});
  }
}
