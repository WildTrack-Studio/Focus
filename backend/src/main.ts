import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const apiPrefix = configService.get<string>('apiPrefix');
  const corsOrigin = configService.get<string>('security.corsOrigin');
  
  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  
  // Global prefix
  app.setGlobalPrefix(apiPrefix || 'api/v1');
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('FOCUS API')
    .setDescription('Wildlife tracking platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Projects', 'Project management endpoints')
    .addTag('Images', 'Image upload and management endpoints')
    .addTag('Detections', 'ML detection results endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  await app.listen(port ?? 4000);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
