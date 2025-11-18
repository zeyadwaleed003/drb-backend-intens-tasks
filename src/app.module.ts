import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env, env } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [env],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => {
        const logger = new Logger('MongooseModule');
        return {
          uri: configService.get<string>('DATABASE_URL'),
          onConnectionCreate: (connection: Connection) => {
            connection.on('connected', () => {
              logger.log('Database connected successfully');
            });
            connection.on('error', (err) => {
              logger.error('Database connection error:', err);
            });
            return connection;
          },
        };
      },
    }),
    HealthModule,
    AuthModule,
    VehiclesModule,
  ],
})
export class AppModule {}
