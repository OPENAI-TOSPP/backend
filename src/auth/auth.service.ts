import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async oauthLogin(oauthUser: {
    provider: 'google' | 'kakao';
    providerId: string;
    email: string;
    name: string;
    profileImage?: string;
  }) {
    const user = await this.usersService.upsertOAuthUser(oauthUser);
    const tokens = await this.generateTokens(user.id, user.email);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefresh);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedHash = await this.usersService.getRefreshToken(payload.sub);
    if (!storedHash) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const isValid = await bcrypt.compare(refreshToken, storedHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(payload.sub, payload.email);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(payload.sub, hashedRefresh);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const expiresIn = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: expiresIn as any }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExpiresIn as any }),
    ]);

    return { accessToken, refreshToken };
  }
}
