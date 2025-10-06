import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { MessagesService } from '../messages/messages.service';
  import { RoomsService } from '../rooms/rooms.service';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../prisma/prisma.service';
  
  @WebSocketGateway({ 
    cors: { origin: '*' },
    namespace: '/chat'
  })
  export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
  
    constructor(
      private readonly messagesService: MessagesService,
      private readonly roomsService: RoomsService,
      private readonly jwtService: JwtService,
      private readonly prisma: PrismaService,
    ) {}
  
    afterInit(server: Server) {
      console.log('ChatGateway initialized');
    }
  
    async handleConnection(client: Socket) {
      try {
        const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          client.disconnect();
          return;
        }

        const payload = this.jwtService.verify(token);
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, username: true },
        });

        if (!user) {
          client.disconnect();
          return;
        }

        client.data.user = user;
        console.log(`Client connected: ${client.id} (User: ${user.username})`);
      } catch (error) {
        console.log('Authentication failed:', error.message);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('joinRoom')
    async onJoinRoom(
      @ConnectedSocket() client: Socket,
      @MessageBody() payload: { chatRoomId: number }
    ) {
      try {
        const { chatRoomId } = payload;
        const userId = client.data.user.id;

        // Verify user is a participant of the room
        const room = await this.roomsService.findOne(chatRoomId, userId);
        
        const roomName = `room-${chatRoomId}`;
        client.join(roomName);
        
        client.emit('joined', { chatRoomId, room: roomName });
        console.log(`User ${client.data.user.username} joined room ${chatRoomId}`);
      } catch (error) {
        client.emit('error', { message: 'Failed to join room' });
      }
    }

    @SubscribeMessage('leaveRoom')
    async onLeaveRoom(
      @ConnectedSocket() client: Socket,
      @MessageBody() payload: { chatRoomId: number }
    ) {
      const { chatRoomId } = payload;
      const roomName = `room-${chatRoomId}`;
      client.leave(roomName);
      client.emit('left', { chatRoomId, room: roomName });
    }
  
    @SubscribeMessage('sendMessage')
    async onSendMessage(
      @ConnectedSocket() client: Socket,
      @MessageBody() payload: { text: string; chatRoomId: number }
    ) {
      try {
        const { text, chatRoomId } = payload;
        const userId = client.data.user.id;

        // Verify user is a participant of the room
        await this.roomsService.findOne(chatRoomId, userId);

        const message = await this.messagesService.create({
          text,
          userId,
          chatRoomId,
        });

        const roomName = `room-${chatRoomId}`;
        this.server.to(roomName).emit('newMessage', {
          ...message,
          user: client.data.user,
        });

        return { status: 'ok', message };
      } catch (error) {
        client.emit('error', { message: 'Failed to send message' });
        return { status: 'error', message: error.message };
      }
    }

    @SubscribeMessage('typing')
    async onTyping(
      @ConnectedSocket() client: Socket,
      @MessageBody() payload: { chatRoomId: number; isTyping: boolean }
    ) {
      const { chatRoomId, isTyping } = payload;
      const roomName = `room-${chatRoomId}`;
      
      client.to(roomName).emit('userTyping', {
        userId: client.data.user.id,
        username: client.data.user.username,
        isTyping,
      });
    }
  }