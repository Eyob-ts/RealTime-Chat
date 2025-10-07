import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddUserDto } from './dto/add-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    return this.roomsService.create(createRoomDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.roomsService.findAll(req.user.id);
  }

  @Get('search')
  search(@Query('query') query: string, @Request() req) {
    return this.roomsService.searchUsers(query, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomsService.findOne(id, req.user.id);
  }

  @Get(':id/messages')
  getMessages(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomsService.getMessages(id, req.user.id);
  }

  @Post(':id/add-user')
  addUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() addUserDto: AddUserDto,
    @Request() req,
  ) {
    return this.roomsService.addUser(id, addUserDto, req.user.id);
  }

  // @Get('search')
  // search(@Query('query') query: string, @Request() req) {
  //   return this.roomsService.searchUsers(query, req.user.id);
  // }

  @Post('private/:targetUserId')
  createPrivate(@Param('targetUserId', ParseIntPipe) targetUserId: number, @Request() req) {
    return this.roomsService.createPrivateRoom(targetUserId, req.user.id);
  }
  @Post('join-by-invite-code')
  joinByInviteCode(@Body() body: { inviteCode: string }, @Request() req) {
    return this.roomsService.joinByInviteCode(body.inviteCode, req.user.id);
  }

}
