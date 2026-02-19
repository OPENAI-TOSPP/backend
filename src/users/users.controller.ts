import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회', description: '액세스 토큰으로 로그인한 사용자의 프로필 정보를 반환합니다.' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 반환',
    schema: { example: { data: { id: 'uuid', email: 'user@example.com', name: '홍길동', profileImage: 'https://...' } } },
  })
  @ApiResponse({ status: 401, description: '인증 필요 (액세스 토큰 누락 또는 만료)' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) throw new NotFoundException('User not found');
    const { refreshToken, ...result } = user;
    return result;
  }
}
