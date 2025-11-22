import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // set a global prefix for all api endpoints except the health check
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // Implement a global api versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw an exception if non-whitelisted properties, can't work without the *whitelist* option is set to true
    })
  );

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false, // Set to true if you want more detailed error structure
    })
  );

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('DRB API')
    .setDescription('DRB API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // API Swagger docs available on "/docs"
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs/json',
  });

  // Need extended parsing!
  app.set('query parser', 'extended');
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
