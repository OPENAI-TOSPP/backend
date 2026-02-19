import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'policygen',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // disable in production
});
