import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) throw new NotFoundException('User not found');
    const { refreshToken, ...result } = user;
    return result;
  }
}
