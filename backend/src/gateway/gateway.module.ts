import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.getway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MessagesModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class GatewayModule {}
