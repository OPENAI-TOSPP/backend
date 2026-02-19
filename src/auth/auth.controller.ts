import { Controller, Get, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard, KakaoOAuthGuard } from './guards/oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 로그인 시작', description: 'Google 로그인 페이지로 리다이렉트합니다.' })
  @ApiResponse({ status: 302, description: 'Google 인증 페이지로 리다이렉트' })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 콜백', description: 'Google 인증 후 프론트엔드로 토큰을 전달합니다.' })
  @ApiResponse({ status: 302, description: '프론트엔드 /auth/callback?accessToken=...&refreshToken=... 으로 리다이렉트' })
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const tokens = await this.authService.oauthLogin(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  @Get('kakao')
  @UseGuards(KakaoOAuthGuard)
  @ApiOperation({ summary: 'Kakao OAuth 로그인 시작', description: 'Kakao 로그인 페이지로 리다이렉트합니다.' })
  @ApiResponse({ status: 302, description: 'Kakao 인증 페이지로 리다이렉트' })
  async kakaoAuth() {}

  @Get('kakao/callback')
  @UseGuards(KakaoOAuthGuard)
  @ApiOperation({ summary: 'Kakao OAuth 콜백', description: 'Kakao 인증 후 프론트엔드로 토큰을 전달합니다.' })
  @ApiResponse({ status: 302, description: '프론트엔드 /auth/callback?accessToken=...&refreshToken=... 으로 리다이렉트' })
  async kakaoAuthCallback(@Request() req, @Res() res: Response) {
    const tokens = await this.authService.oauthLogin(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: '액세스 토큰 갱신', description: 'Refresh token으로 새 액세스 토큰을 발급합니다.' })
  @ApiResponse({ status: 200, description: '새 토큰 발급 성공', schema: { example: { data: { accessToken: 'eyJ...', refreshToken: 'eyJ...' } } } })
  @ApiResponse({ status: 401, description: '유효하지 않거나 만료된 refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃', description: '서버에 저장된 refresh token을 무효화합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공', schema: { example: { data: { message: 'Logged out successfully' } } } })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }
}
