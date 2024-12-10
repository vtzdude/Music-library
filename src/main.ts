import { NestFactory } from '@nestjs/core';
import { HttpException, HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.enableVersioning();

  app.use(helmet());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const errorMessage = firstError.constraints[Object.keys(firstError.constraints)[0]];
        return new HttpException({ error: true, message: errorMessage, status: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST);
      },
    }),
  );
  app.setGlobalPrefix(AppModule.apiPrefix);

  await app.listen(AppModule.port);
  return AppModule.port;
};

bootstrap().then((port: number) => {
  Logger.log(`Application running on port: ${port}`, 'Main');
});
