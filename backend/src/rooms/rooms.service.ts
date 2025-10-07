import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddUserDto } from './dto/add-user.dto';
import { nanoid } from 'nanoid';
import { ChatGateway } from '../gateway/chat.getway';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway)) private chatGateway: ChatGateway) {}

  async create(createRoomDto: CreateRoomDto, userId: number) {
    const { name, isGroup = false } = createRoomDto;
    const inviteCode = isGroup ? nanoid(10) : null;

    const room = await this.prisma.chatRoom.create({
      data: {
        name,
        isGroup,
        inviteCode,
        participants: {
          create: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return room;
  }

  async findAll(userId: number) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return rooms;
  }

  // Join a group via invite code
  async joinByInviteCode (inviteCode: string, userId: number) {
    const room = await this.prisma.chatRoom.findUnique({
      where: {inviteCode},
      include: { participants:true }
    });

    if (!room) {
      throw new NotFoundException('Invite code is invalid');
    }

    // Aready participant ? 
    const alreadyParticipant = room.participants.some(p=>p.userId === userId);
    if (alreadyParticipant) return room;

    // Add user to participants
    const participant = await this.prisma.chatRoomParticipant.create({
      data: {userId, chatRoomId: room.id},
    });

    // notify the user via websocket that they were added
    try {
      this.chatGateway.emitToUser(userId, 'addedToRoom', { roomId: room.id });
    } catch (e) {
      // don't block on notification errors
      console.warn('Failed to emit addedToRoom', e?.message || e);
    }

    return room;
  }

  async findOne(id: number, userId: number) {
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found or access denied');
    }

    return room;
  }

  async addUser(roomId: number, addUserDto: AddUserDto, userId: number) {
    const { userId: targetUserId } = addUserDto;

    // Check if the current user is a participant of the room
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    if (!room) {
      throw new ForbiddenException('You are not a participant of this room');
    }

    // Check if the target user is already a participant
    const existingParticipant = await this.prisma.chatRoomParticipant.findUnique({
      where: {
        userId_chatRoomId: {
          userId: targetUserId,
          chatRoomId: roomId,
        },
      },
    });

    if (existingParticipant) {
      throw new ForbiddenException('User is already a participant of this room');
    }

    // Add the user to the room
    const participant = await this.prisma.chatRoomParticipant.create({
      data: {
        userId: targetUserId,
        chatRoomId: roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // notify the added user via websocket
    try {
      this.chatGateway.emitToUser(targetUserId, 'addedToRoom', { roomId });
    } catch (e) {
      console.warn('Failed to emit addedToRoom', e?.message || e);
    }

    return participant;
  }

  async getMessages(roomId: number, userId: number) {
    // Check if user is a participant
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    if (!room) {
      throw new ForbiddenException('You are not a participant of this room');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        chatRoomId: roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  async searchUsers(query: string, currentUserId: number) {
    return this.prisma.user.findMany({
        where: {
            username: {
                contains: query,
                mode: 'insensitive',
            },
            NOT: {
                id: currentUserId,
            },
        },
        select: {
            id: true,
            username: true,
        },
        take: 10,
    });
  }

  async createPrivateRoom(targetUserId: number, currentUserId: number) {
    const existingRoom = await this.prisma.chatRoom.findFirst({
        where: {
            isGroup: false,
            participants: {
                every: {
                    userId: {in: [targetUserId, currentUserId]}
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            }
        }
    });

    if (existingRoom) {
        return existingRoom;
  }
  const newRoom = await this.prisma.chatRoom.create({
    data: {
        name: "",
        isGroup: false,
        participants: {
            create: [{userId: targetUserId}, {userId: currentUserId}],
        },
    },
    include: {
        participants: {
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        },
    },
  });

  // notify the target user they were added to a private room
  try {
    this.chatGateway.emitToUser(targetUserId, 'addedToRoom', { roomId: newRoom.id });
  } catch (e) {
    console.warn('Failed to emit addedToRoom', e?.message || e);
  }

  return newRoom;
}
}
