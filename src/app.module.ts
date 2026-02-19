import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GenerationModule } from './generation/generation.module';
import { DocumentsModule } from './documents/documents.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    // IP 기준 분당 20회, 시간당 200회 제한
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 20 },
      { name: 'long', ttl: 3_600_000, limit: 200 },
    ]),
    AuthModule,
    UsersModule,
    GenerationModule,
    DocumentsModule,
    ExportModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
