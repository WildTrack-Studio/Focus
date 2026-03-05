import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 secondes
      limit: 100, // 100 requêtes max
    }]),
    
    // Prisma (Database)
    PrismaModule,
    
    // Modules métier
    AuthModule,
    UsersModule,
    // ProjectsModule,
    // ImagesModule,
    // DetectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
