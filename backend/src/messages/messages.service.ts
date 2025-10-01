import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}
  async create(createMessageDto: CreateMessageDto) {
    const user = await this.prisma.user.findUnique({where: {id: createMessageDto.userId}});
    const chatRoom = await this.prisma.chatRoom.findUnique({where: {id: createMessageDto.chatRoomId}});
    if (!user || !chatRoom) {
      throw new Error('User or chat room not found');
    }
    return this.prisma.message.create({
      data: {
        text: createMessageDto.text,
        user: {connect: {id: user.id}},
        chatRoom: {connect: {id: chatRoom.id}}}});

  }

  async findByChatRoom(chatRoomId: number, limit= 50, skip = 0) {
    return this.prisma.message.findMany({
      where: {chatRoomId},
      orderBy: {createdAt: 'desc'},
      include: {user: true},
      take: limit,
      skip,
    });
  }

}