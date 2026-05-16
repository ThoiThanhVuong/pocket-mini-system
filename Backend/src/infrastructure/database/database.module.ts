import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>('database.url');
        const isNeon = url?.includes('neon.tech');
        const explicitSsl = configService.get<boolean>('database.ssl');

        return {
          type: 'postgres',
          ...(url 
            ? { url } 
            : {
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.name'),
              }
          ),
          ssl: isNeon || explicitSsl ? { rejectUnauthorized: false } : false,
          // Các tùy chọn khác
          autoLoadEntities: true,
          synchronize: configService.get<boolean>('database.sync') ?? false, 
          logging: true,
        };
      },
    }),
  ],
  providers: [DatabaseSeeder],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('Database connected successfully!');
    }
  }
}
