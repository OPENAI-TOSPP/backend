import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { provider: provider as any, providerId } });
  }

  async upsertOAuthUser(data: {
    email: string;
    name: string;
    provider: 'google' | 'kakao';
    providerId: string;
    profileImage?: string;
  }): Promise<User> {
    let user = await this.findByProvider(data.provider, data.providerId);

    if (user) { // DB에 있는 경우 갱신
      user.name = data.name;
      user.email = data.email;
      if (data.profileImage) user.profileImage = data.profileImage;
      return this.usersRepository.save(user);
    }

    // 없는 경우 추가
    user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: refreshToken as any });
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const user = await this.findById(userId);
    return user?.refreshToken || null;
  }
}
