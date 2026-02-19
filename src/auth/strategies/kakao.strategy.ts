import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID') || '',
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL') || '',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, _json } = profile;
    const user = {
      provider: 'kakao' as const,
      providerId: String(id),
      email: _json?.kakao_account?.email || `kakao_${id}@kakao.com`,
      name: username || _json?.properties?.nickname || 'Kakao User',
      profileImage: _json?.properties?.profile_image,
    };
    done(null, user);
  }
}
