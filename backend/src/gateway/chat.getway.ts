import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { MessagesService } from '../messages/messages.service';
  
  @WebSocketGateway({ cors: { origin: '*' } }) // later lock down origin
  export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
  
    constructor(private readonly messagesService: MessagesService) {}
  
    afterInit(server: Server) {
      console.log('ChatGateway initialized');
    }
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('joinRoom')
    async onJoinRoom(client: Socket, payload: { chatRoomId: number; roomId?: number; username?: string }) {
      const roomId = payload.chatRoomId || payload.roomId;
      const room = `room-${roomId}`;
      client.join(room);
      client.emit('joined', { chatRoomId: roomId });
    }
  
    @SubscribeMessage('sendMessage')
    async onSendMessage(client: Socket, payload: { text: string; userId: number; chatRoomId: number }) {
      const message = await this.messagesService.create({
        text: payload.text,
        userId: payload.userId,
        chatRoomId: payload.chatRoomId,
      });
  
      const room = `room-${payload.chatRoomId}`;
      this.server.to(room).emit('newMessage', message);
      return { status: 'ok' };
    }
  }